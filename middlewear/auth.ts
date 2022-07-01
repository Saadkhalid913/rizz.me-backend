import { User } from "@prisma/client"
import express from "express"
import * as jwt from "jsonwebtoken"
export default async function(req: express.Request,res: express.Response, next: express.NextFunction) {
    // @ts-ignore
    const JWT = req.session.auth!
    console.log(req.session)
    if (!JWT) return res.status(403).send({"message": "no authentication passed"})
    
    try {
        const payload = jwt.verify(JWT, process.env.key!)
        // @ts-ignore
        req._user = payload as User
        next()
    }
    catch(err){
        res.status(401).send({"message": "no authentication passed"})
    }
}