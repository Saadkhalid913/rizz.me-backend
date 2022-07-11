import express, { Express } from "express"
import UserRouter from "../routes/user"
import ChatRouter from "../routes/chats"

export default (app: Express) => {
    app.use("/api/user", UserRouter)
    app.use("/api/chats", ChatRouter)
}