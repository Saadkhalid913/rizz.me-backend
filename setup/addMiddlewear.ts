import express, {Express} from "express" 
import cors from "cors"

export default (app: Express) => {
    app.use(express.json)
    app.use(cors({origin: (process.env.TS_NODE_DEV ? "*" : process.env.client_origin)}))
}