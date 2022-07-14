import { User } from "@prisma/client"
import express from "express"
import * as jwt from "jsonwebtoken"
export default async function(req: express.Request,res: express.Response, next: express.NextFunction) {
    let JWT: string | undefined;

    // @ts-ignore
    JWT = req.session.auth

    if ((!JWT) && (process.env.NODE_ENV == "test")) JWT = req.headers["auth-token"] as string

    if (!JWT) return res.status(403).send({"message": "no authentication passed"})
    
    try {
        const payload = jwt.verify(JWT, process.env.key!)
        
        // @ts-ignore
        req._user = payload as User
        next()
    }
    catch(err){
        res.status(401).send({"message": "Invalid credentials"})
    }
}