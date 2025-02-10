import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken"
import { authMiddleware } from "../authMiddleware";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { taskSchema } from "../types";
import { TOTAL_DECIMALS } from "../config";


const prismaClient = new PrismaClient();


if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not set");
}

const s3Client = new S3Client({
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const router = Router();

router.post("/signin", async (req, res) => {
    
    const harcodedWallet = "0x1234567890";

    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: harcodedWallet
        }
    });

    if(existingUser){
        const token = jwt.sign({id:existingUser.id}, process.env.JWT_SECRET!);
        res.json({token});
    } else {
        const newUser = await prismaClient.user.create({
            data: {
                address: harcodedWallet
            }
        });

        const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET!);
        res.json({token});
    }
});


router.get("/getPresingedUrl", authMiddleware, async (req: Request, res: Response) => {
      //@ts-ignore
      const id = req.userId;
      const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'decentralised-upwork',
        Key: `upwork/${id}/${Math.random()}/image.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Expires: 3600
    })
      //console.log ({url,fields});

      res.json({preSigned:url,fields});
});


router.get("/task", authMiddleware, async (req: Request, res: Response) => {
    //@ts-ignore
    const userId:string = req.userId;
    //@ts-ignore
    const id:string = req.query.taskId;

    const tasks = await prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(id)
        },
        include: {
            options: true
        }
    });

    if(!tasks){
        res.status(404).json({message:"Task not found"});
        return;
    }
    
    const response =await prismaClient.submission.findMany({
        where: {
            task_id: Number(id)
        },
        include: {
            option: true
        }
    })

    const result: Record<string, {
        count: number,
        option:{
            image_url: string,
        }
    }> = {};

    tasks.options.forEach(option => {
        result[option.id]={
            count:0,
            option: {
                image_url: option.image_url
            }
        }
    })
    
    response.forEach(r => {
        result[r.option_id].count++;
    })
    res.json({result,tasks});
});

router.post("/task", authMiddleware, async (req: Request, res: Response) => {
    //@ts-ignore
    const id = req.userId;
    //console.log(req.body);
    const parsed = taskSchema.safeParse(req.body);
    console.log(id)
    if(!parsed.success){
        res.status(411).json({message:"Incorrect data format"});
        return;
    }

    let response = await prismaClient.$transaction(async (tx) => {
        const response = await tx.task.create({
            data: {
                title: parsed.data.title ?? "Select most clickable image",
                amount: 0.1*TOTAL_DECIMALS,
                sign: parsed.data.sign,
                user_id: id
            }
        })


        await tx.option.createMany({
            data: parsed.data.options.map((option) => ({
                image_url: option.image_url,
                task_id: response.id
            }))
        })
        return response;
    })

    res.json({id: response.id});
});

export default router;
