import express from  "express"
import addMiddlewear from "./setup/addMiddlewear";
import addRoutes from "./setup/addRoutes";
import ConfigInit from "./setup/environmentSetup";
import { IsTesting } from "./utils";
import SocketIOinit from "./socketio";
import { errorMiddlewear } from "./error_handling/errorMiddlewear";



const app = express()

ConfigInit()
addMiddlewear(app)
if (process.env.NODE_ENV == "production") {
    // app.get("/" , (req,res) => res.send("Nothing to see here!"))
    addRoutes(app)
}
else addRoutes(app)

app.use(errorMiddlewear)




const PORT = process.env.PORT || 3000;


let server

if (!IsTesting()) { 
    server = SocketIOinit(app) 
    server.listen(PORT, () =>  {console.log("Listening on port #" + PORT)}) 
}
else {
    server = app.listen(PORT) 
}
module.exports = server
