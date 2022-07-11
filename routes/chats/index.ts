import express from "express"
import prisma from "../../db"
import { HTTPError } from "../../error_handling/errors";
import bcrypt from "bcrypt"

import { GenerateRandomUsername, GenerateRandomCredentials } from "./utils";
import { CreateJWT } from "../../utils";

const router = express.Router()


type ChatCredentials = {
    anon_username: string
    anon_id: string,
    chat_id: string
}

router.post("/create/:username", async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
        throw new HTTPError("Could not find a profile with that username", {
            HTTPErrorCode: 401,
            endUserMessage: "Could not find a profile with username:" + username,
            routePath: "/chats/create/:username",
            resource: req
        })
    }

    const anon_username = GenerateRandomUsername()
    const anon_password = GenerateRandomCredentials()

    const salt = await bcrypt.genSalt(10)
    const hashed_credentials = await bcrypt.hash(anon_password, salt)

    try {
        const NewChat = await prisma.chat.create({
            data: {
                non_anon_username: user.username,
                non_anon_id: user.id,
                anon_username,
                anon_credentials: hashed_credentials
            }
        })

        const chatCredentials: ChatCredentials = {
            anon_username,
            anon_id: NewChat.anon_id,
            chat_id: NewChat.id
        }

        const JWT = CreateJWT(chatCredentials)

        return res.status(200).send({
            data: {
                username: anon_username,
                password: anon_password,
                JWT
            }
        })
    }

    catch (err) {
        throw new HTTPError("There was an error creating your chat", {
            HTTPErrorCode: 504,
            endUserMessage: "There was an error creating your chat",
            routePath: "/chats/create/:username",
            resource: { req, err }
        })
    }
})


export default router