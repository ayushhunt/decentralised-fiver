import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { workerMiddleware } from "../authMiddleware";

const prismaClient = new PrismaClient();
const router = Router();

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

router.get("/nextTask",workerMiddleware,async (req,res)=>{
    //@ts-ignore
    const id = req.userId;
    const task = await prismaClient.task.findFirst({
        where:{
            done:false,
            submissions:{
                none:{
                    worker_id:id,
                }
            }
        },
        select:{
            title:true,
            options:true,
        }
    })

    if(task){
        res.json({task});
    } else {
        res.json({message:"No tasks available"});
    }

})


export default router;