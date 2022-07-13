import express from "express"
import bcrypt from "bcrypt"
import prisma from "../../db"
import { CreateJWT } from "../../utils"
import auth from "../../middlewear/auth"
import { HTTPError } from "../../error_handling/errors"
import { missingFieldError } from "../../error_handling/throwers"
import { handlerWrapper } from "../../error_handling/errorMiddlewear"

const router = express.Router()

const SignupHandler = async (req: express.Request,res: express.Response) => {
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


const LoginHandler = async (req: express.Request<any>,res: express.Response) => {
    const { username, password } = req.body
    const user = await prisma.user.findUnique({where: {username}})
    if (!user) return res.status(401).send({"message": "no user found"})
    const valid = await bcrypt.compare(password, user.password)
    if (valid) {
        // @ts-ignore 
        req.session.auth = CreateJWT(user)
        console.log("---- session in route ----", req.session)
    }
    else {
        return res.status(400).send({"Message": "Incorrect password"})
    }
}




router.post("/", handlerWrapper(SignupHandler))
router.post("/login", handlerWrapper(LoginHandler))

export default router 