import express from "express"
import bcrypt from "bcrypt"
import prisma from "../../db"
import { CreateJWT, IsTesting } from "../../utils"
import auth from "../../middlewear/auth"
import { HTTPError } from "../../error_handling/errors"
import { missingFieldError } from "../../error_handling/throwers"
import { handlerWrapper } from "../../error_handling/errorMiddlewear"

const router = express.Router()

const SignupHandler = async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body

    if (!username) missingFieldError("username", req, "/user")
    if (!password) missingFieldError("password", req, "/user")

    const salt = await bcrypt.genSalt()
    const hashed_password = await bcrypt.hash(password, salt)

    try {
        const NewUser = await prisma.user.create({
            data: {
                username, password: hashed_password
            }
        })
        const JWT = CreateJWT(NewUser)
        
        // @ts-ignore
        req.session.auth = JWT 
        res.send({"message": "new user created"})
    } 
    catch(err) {
        throw new HTTPError("Could not create a profile", {
            HTTPErrorCode: 401,
            endUserMessage: "Could not create a profile: " + username,
            routePath: "/user",
            resource: {req, err}
        })
    }
}


const LoginHandler = async (req: express.Request,res: express.Response) => {

    const { username, password } = req.body

    if (!username) missingFieldError("username", req, "/user")
    if (!password) missingFieldError("password", req, "/user")

    const user = await prisma.user.findUnique({where: {username}})

    if (!user) {
        throw new HTTPError("Could not find a user with that username", {
            HTTPErrorCode: 401,
            endUserMessage: "Could not find a user with that username",
            routePath: "/user",
            resource: req
        })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (valid) {
        const JWT = CreateJWT(user)
        
        // @ts-ignore 
        req.session.auth = JWT 
        if (IsTesting()) res.set("auth-token", JWT)

        res.status(200).send({success: true})
    }

    else {
        throw new HTTPError("Could not create a profile", {
            HTTPErrorCode: 401,
            endUserMessage: "Incorrect Password",
            routePath: "/user",
            resource: req
        })
    }
}


async function DeleteUser(username: string) {
    const chat_delete_response = await prisma.chat.deleteMany({where: {
        non_anon_username: username
    }})

    const user_delete_response = await prisma.user.delete({where: {
        username: username
    }})

    return user_delete_response
}

const DeleteProfileHandler = async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;
    
    if (!username) missingFieldError("username", req, "/user")
    if (!password) missingFieldError("password", req, "/user")
    
    const response = await DeleteUser(username)

    if (!response.id) {
        throw new HTTPError("There was an error deleting your profile", {
            HTTPErrorCode: 503,
            endUserMessage: "There was an error deleting your profile",
            routePath: "/user",
            resource: req
        })
    }
    
    const id = response.id;
    const deletedUsername = response.username;

    return res.status(200).send({
        username: deletedUsername,
        id
    })
}

const GetProfileInfoHandler = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const { username } = req._user;

    const response = await prisma.user.findUnique({
        where: { username },
        include: {
            chats: {
                select: {
                    anon_credentials: false,
                    non_anon_username: true,
                    anon_username: true,
                    id: true,
                    messages: { 
                        take: 1,
                        orderBy: {
                            timestamp: "desc"
                        }
                    }
                }
            }
        }
    })

    if (!response?.id) {
        throw new HTTPError("Could not find a user with that username", {
            HTTPErrorCode: 401,
            endUserMessage: "Could not find a user with that username",
            routePath: "/user/me",
            resource: req
        })
    }

    return res.status(200).send({
        username: response.username,
        chats: response.chats,
        max_chat_limit: response.max_chat_limit
    })
}


const LogoutHandler = async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    req.session?.destroy() 
    res.send({message: "Logged out successfully"})
}

router.post("/", handlerWrapper(SignupHandler))
router.post("/login", handlerWrapper(LoginHandler))
router.delete("/", handlerWrapper(DeleteProfileHandler))
router.get("/me", auth, handlerWrapper(GetProfileInfoHandler))
router.get("/logout", auth, handlerWrapper(LogoutHandler))

export default router 