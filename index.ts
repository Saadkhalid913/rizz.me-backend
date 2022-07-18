import express from  "express"
import addMiddlewear from "./setup/addMiddlewear";
import addRoutes from "./setup/addRoutes";
import ConfigInit from "./setup/environmentSetup";
import { IsTesting } from "./utils";
import SocketIOinit from "./socketio";
import { errorMiddlewear } from "./error_handling/errorMiddlewear";
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express()

ConfigInit()


app.use(limiter)
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
