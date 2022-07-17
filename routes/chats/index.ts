import express from "express"
import prisma from "../../db"
import { HTTPError } from "../../error_handling/errors";
import bcrypt from "bcrypt"
import auth from "../../middlewear/auth"
import { GenerateRandomUsername, GenerateRandomCredentials } from "./utils";
import { CreateJWT } from "../../utils";
import { ChatCredentials } from "../../main";
import { handlerWrapper } from "../../error_handling/errorMiddlewear";
import { missingFieldError } from "../../error_handling/throwers";

const router = express.Router()


const CreateChatHandler = async (req: express.Request, res: express.Response) => {
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
            non_anon_id: user.id,
            anon_id: NewChat.anon_id,
            chat_id: NewChat.id
        }

        const JWT = CreateJWT(chatCredentials)

        return res.status(200).send({
            data: {
                username: anon_username,
                password: anon_password,
                JWT,
                chat_id: (process.env.NODE_ENV == "test") ? NewChat.id : undefined
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
}


const GetCredentialsWrapper = async (req:express.Request, res: express.Response) => {
    const {chatID} = req.params

    if (!chatID) missingFieldError("ChatID", req, "/chats/getcredentials/:chatID")

    const userID = req._user.id

    const chat = await prisma.chat.findUnique({where: {id: chatID}})
    if (chat == null) {
        throw new HTTPError("No chat with that id", {
            HTTPErrorCode: 401,
            endUserMessage: "No chat with that id",
            routePath: "/chats/getcredentials/:chatID",
            resource: req
        })
    }

    try {
       

        const { id: chat_id, non_anon_id, anon_id, anon_username } = chat

        const chatCredentials: ChatCredentials = {
            chat_id,
            non_anon_id,
            anon_id,
            anon_username
        }

        const JWT = CreateJWT(chatCredentials)
        return res.status(200).send({JWT})
    }
    catch (err) {
        console.log(err)
        throw new HTTPError("There was an error", {
            HTTPErrorCode: 504,
            endUserMessage: "There was an error",
            routePath: "/chats/getcredentials/:chatID",
            resource: { req, err }
        })
    }

}

const GetAnonCredentialsWrapper = async (req: express.Request, res: express.Response) => {
    const { username, password, non_anon_username } = req.body

    if (!username) missingFieldError("username", req, "/getcredentials/anon/:chatID")
    if (!password) missingFieldError("password", req, "/getcredentials/anon/:chatID")
    if (!non_anon_username) missingFieldError("non_anon_username", req, "/getcredentials/anon/:chatID")


    const chat = await prisma.chat.findFirst({where: {
        non_anon_username,
        anon_username: username
    }})

    if (chat == null) {
        throw new HTTPError("No chat with that id", {
            HTTPErrorCode: 401,
            endUserMessage: "No chat with that id",
            routePath: "/chats/getcredentials/:chatID",
            resource: req
        })
    }

    const { id: chat_id, non_anon_id, anon_id, anon_username } = chat

        const chatCredentials: ChatCredentials = {
            chat_id,
            non_anon_id,
            anon_id,
            anon_username
        }
    const JWT = CreateJWT(chatCredentials)
    return res.status(200).send({JWT})
}


router.post("/create/:username", handlerWrapper(CreateChatHandler))

router.get("/getcredentials/:chatID", auth, handlerWrapper(GetCredentialsWrapper))
router.post("/getcredentials/anon",  handlerWrapper(GetAnonCredentialsWrapper))


export default router