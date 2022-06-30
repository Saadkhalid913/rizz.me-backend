
import express , { Express} from "express"
import UserRouter from "../routes/user/user"



export default (app: Express) => {
    app.use("/api/user", UserRouter)
}