import express, {Express} from "express" 
import cors from "cors"
import session from "express-session"

export default (app: Express) => {
    app.set("trust proxy", 1)
    app.use(express.json())
    app.use(cors({origin: (process.env.TS_NODE_DEV ? "*" : process.env.client_origin)}))
    app.use(session({
        name: "auth",
        secret: process.env.key!,
        resave: false,
        saveUninitialized: true,
        proxy: true,
        cookie: { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 48, sameSite: 'none', domain: process.env.cookie_domain }
    }))
}