import { Server } from "socket.io"
import { Express } from "express"
import http from "http"
import prisma from "../db"
import { ChatCredentials } from "../main"

import * as jwt from "jsonwebtoken"

interface Chat {
    JWT: string;
    data: string;
}


export default function SocketIOinit(app: Express) {        

    const server = http.createServer(app);
    const io = new Server(server,{ cors: {
        origin: process.env.client_origin,
        methods: ["GET", "POST"]
      }})

    io.on('connection', (socket) => {
        console.log("Connected...")
        socket.on("test-event" , (...args) => {
            console.log("This is the test event")
            console.log(args)
        })

        socket.on("chat-sent", (chat: Chat) => {
            const {JWT, data} = chat            
            try {
                const payload = jwt.verify(JWT, process.env.key!) as ChatCredentials
                console.log(payload, data)
            }
            catch(err) {
                console.log(err)
            }
        })
    });

    return server 
}



