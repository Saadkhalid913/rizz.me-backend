import { Server} from "socket.io"
import { Express } from "express"
import http from "http"

export default function SocketIOinit(app: Express) {
    const server = http.createServer(app);
    const io = new Server(server,{cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
      }})

    io.on('connection', (socket) => {


        socket.on("test-event" , (...args) => {
            console.log("This is the test event")
            console.log(args)
        })
    });

    return server 
}



