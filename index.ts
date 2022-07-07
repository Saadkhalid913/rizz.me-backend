import express from  "express"
import addMiddlewear from "./setup/addMiddlewear";
import addRoutes from "./setup/addRoutes";
import ConfigInit from "./setup/environmentSetup";
import { IsTesting } from "./utils";
import SocketIOinit from "./socketio";
import e from "express";

const app = express()

ConfigInit()
addMiddlewear(app)
addRoutes(app)

app.get("/" , (req,res) => res.send("Hello world!"))


const PORT = process.env.PORT || 3000;

if (!IsTesting()) { 
    const server = SocketIOinit(app) 
    server.listen(PORT, () =>  {console.log("Listening on port #" + PORT)}) 
}
else {
    app.listen(PORT, () =>  {console.log("Listening on port #" + PORT)}) 
}
export default app
