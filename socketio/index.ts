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


async function SaveSentChat(Chat: string, ChatCredentials: ChatCredentials) {
    const { sender, recipient, chat_id } = ChatCredentials
    const chat_response = await prisma.chatMessage.create({
        data: {
            text: Chat,
            sender,
            recipient,
            conversation_id: chat_id
        }
    })
    return chat_response
}

export default function SocketIOinit(app: Express) {        

    const server = http.createServer(app);
    const io = new Server(server,{ cors: {
        origin: process.env.client_origin,
        methods: ["GET", "POST"]
      }})

    io.on('connection', (socket) => {

        socket.on("join-chat", async (JWT: string) => {
            try {
                const payload = jwt.verify(JWT, process.env.key!) as ChatCredentials
                const {chat_id} = payload
                socket.join(chat_id)
                
                const ExistingChats = await prisma.chatMessage.findMany({
                    where: {
                        conversation_id: chat_id,
                    },
                    orderBy: {
                        timestamp: "asc"
                    }
                })

                io.to(socket.id).emit("chat-joined", ExistingChats)
            }
            catch(err) {
                console.log(err)
            }
        })

        socket.on("chat-sent", async (chat: Chat) => {
            const {JWT, data} = chat            
            if (data == "") return
            try {
                const payload = jwt.verify(JWT, process.env.key!) as ChatCredentials
                const chat_response = await SaveSentChat(data, payload)
                io.to(payload.chat_id).emit("chat-recieved", (chat_response))
            }
            catch(err) {
                console.log(err)
            }
        })
        
    });

    return server 
}



