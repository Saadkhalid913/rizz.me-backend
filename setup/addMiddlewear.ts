import express, {Express} from "express" 
import cors from "cors"
import session from "express-session"
import prisma from "../db"
import { PrismaSessionStore } from "@quixo3/prisma-session-store"
import cookieparser from "cookie-parser"

export const store = new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,  //ms
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
})


export default (app: Express) => {
    app.set("trust proxy", 1)
    app.use(express.json())
    app.use(cookieparser())
    app.use(cors({origin: process.env.client_origin, credentials: true}))
    app.use(session({
        resave: false,
        saveUninitialized: true,
        name: "authToken",
        secret: process.env.key!,
        store,
        cookie: (process.env.TS_NODE_DEV) ? undefined : { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 48, sameSite: 'none', domain: process.env.cookie_domain }
    }))
    
    app.enable('trust proxy')
}