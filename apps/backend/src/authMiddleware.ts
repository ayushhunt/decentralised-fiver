import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";


export function authMiddleware(req:Request,res:Response,next:NextFunction):void{
    const authHeader = req.headers["authorization"] ?? "";
    if(!authHeader){
        res.status(401).json({error:"Token not provided"});
        return;
    }
    console.log(authHeader);
    try {
        const decoded = jwt.verify(authHeader,process.env.JWT_SECRET!);
        console.log(decoded);
        // @ts-ignore
        if(decoded.id){
            // @ts-ignore
            req.userId = decoded.id;
            next();
        } else {
            res.status(401).json({error:"You are not logged in1"});
            return;
        }
    } catch (error) {
        res.status(403).json({error:"You are not logged in2"});
        return;
    }
}

export function workerMiddleware(req:Request,res:Response,next:NextFunction):void{
    const authHeader = req.headers["authorization"] ?? "";
    if(!authHeader){
        res.status(401).json({error:"Token not provided"});
        return;
    }
    console.log(authHeader);
    try {
        const decoded = jwt.verify(authHeader,process.env.WORKER_JWT_SECRET!);
        console.log(decoded);
        // @ts-ignore
        if(decoded.id){
            // @ts-ignore
            req.userId = decoded.id;
            next();
        } else {
            res.status(401).json({error:"You are not logged in1"});
            return;
        }
    } catch (error) {
        res.status(403).json({error:"You are not logged in2"});
        return;
    }
}