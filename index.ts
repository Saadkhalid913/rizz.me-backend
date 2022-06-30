import express from  "express"
import addMiddlewear from "./setup/addMiddlewear";
import addRoutes from "./setup/addRoutes";
import ConfigInit from "./setup/environmentSetup";

const app = express()

ConfigInit()
addMiddlewear(app)
addRoutes(app)

app.get("/" , (req,res) => res.send("Hello world!"))






const PORT = process.env.PORT || 3000;


app.listen(PORT, () =>  {console.log("Listening on port #" + PORT)}) 

