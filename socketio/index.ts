import { Server } from "socket.io"
import { Express } from "express"
import http from "http"
import prisma from "../db"



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


        // socket.on("chat", async (sender, text) => {
        //     const ChatSendResponse = await prisma.chat.create({
        //         data: {
        //             sender,
        //             text,
        //             recipient:
        //         }
        //     })  
        // })
    });

    return server 
}



