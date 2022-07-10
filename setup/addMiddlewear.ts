import express, {Express} from "express" 
import cors from "cors"
import session from "express-session"
import prisma from "../db"
import { PrismaSessionStore } from "@quixo3/prisma-session-store"
import cookieparser from "cookie-parser"


const origin = (process.env.TS_NODE_DEV) ? "http://localhost:3001" : process.env.client_origin

export default (app: Express) => {
    console.log("Origin: ", origin)
    console.log("Cookie Domain: ", process.env.cookie_domain)
    app.set("trust proxy", 1)
    app.use(express.json())
    app.use(cookieparser())
    app.use(cors({origin: origin, credentials: true}))
    app.use(session({
        resave: false,
        saveUninitialized: true,
        name: "authToken",
        secret: process.env.key!,
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000,  //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),

        cookie: (process.env.TS_NODE_DEV) ? undefined : { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 48, sameSite: 'none', domain: process.env.cookie_domain }
    }))
    app.enable('trust proxy')

}