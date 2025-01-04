import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { workerMiddleware } from "../authMiddleware";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";

const prismaClient = new PrismaClient();
const router = Router();
const TOTAL_SUBMISSIONS = 3;

router.post("/signin", async (req, res) => {
    const harcodedWallet = "0x1234567890AEAE";
    
        const existingUser = await prismaClient.worker.findFirst({
            where: {
                address: harcodedWallet
            }
        });
    
        if(existingUser){
            const token = jwt.sign({id:existingUser.id}, process.env.WORKER_JWT_SECRET!);
            res.json({token});
        } else {
            const newUser = await prismaClient.worker.create({
                data: {
                    address: harcodedWallet,
                    pending_amount:0,
                    locked_amount:0
                    
                }
            });
    
            const token = jwt.sign({id:newUser.id}, process.env.WORKER_JWT_SECRET!);
            res.json({token});
        }
});
router.get("/balance", workerMiddleware, async (req, res) => {
    // @ts-ignore
    const userId: string = req.userId;

    const worker = await prismaClient.worker.findFirst({
        where: {
            id: Number(userId)
        }
    })

    res.json({
        pendingAmount: worker?.pending_amount,
        lockedAmount: worker?.pending_amount,
    })
})

router.post("/payout",workerMiddleware,async (req,res)=>{
    //@ts-ignore
    const id:string = req.userId;
    const worker = await prismaClient.worker.findFirst({
        where:{
            id:Number(id)
        }
    })

    if(!worker){
        res.status(400).json({error:"Worker not found"});
        return;
    }

    const address = worker.address;

    const txnId = "0x1234567890";
    //needs locking
    await prismaClient.$transaction(async tx => {
        await tx.worker.update({
            where:{
                id:Number(id)
            },
            data:{
                pending_amount:{
                    decrement:worker.pending_amount
                },
                locked_amount:{
                    increment:worker.pending_amount
                }
            }
        })

        await tx.payouts.create({
            data:{
                user_id:Number(id),
                amount:worker.pending_amount,
                status:"Processing",
                signature:txnId
            }
        })
    })

    res.json({
        message:"Payout initiated",
        amount:worker.pending_amount,
    })

})


router.post("/submission",workerMiddleware, async (req,res) => {
    //@ts-ignore
    const id = req.userId;
    const body = req.body;
    const parsedData = createSubmissionInput.safeParse(body);

    if(parsedData.success){
        const task = await getNextTask(id);
        if(!task || task?.id !== Number(parsedData.data.taskId)){
            res.status(400).json({error:"Task not found"});
            return;
        }

        const amount = (Number(task.amount)/TOTAL_SUBMISSIONS).toString();
        const submission = prismaClient.$transaction(async tx => {
            const submission = await tx.submission.create({
                data: {
                    option_id: Number(parsedData.data.selection),
                    task_id: task.id,
                    worker_id: id,
                    amount:Number(amount)
                }
            })

            await tx.worker.update({
                where:{
                    id:id
                },
                data:{
                    pending_amount:{
                        increment:Number(amount)
                    }
                }
            })

            return submission;;
        })
        const nextTask = await getNextTask(id);
        res.json({amount,nextTask});
    }else {
        res.status(411).json({
            message: "Incorrect inputs"
        })
    }

})

router.get("/nextTask",workerMiddleware,async (req,res)=>{
    //@ts-ignore
    const id = req.userId;
    const task = await getNextTask(id);

    if(task){
        res.json({task});
    } else {
        res.json({message:"No tasks available"});
    }

})


export default router;