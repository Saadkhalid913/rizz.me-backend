import express from "express"
import bcrypt from "bcrypt"
import prisma from "../../db"
import { CreateJWT } from "../../utils"

const router = express.Router()



router.post("/", async (req: express.Request<any>,res: express.Response) => {
    const { username, password } = req.body

    const salt = await bcrypt.genSalt()
    const hashed_password = await bcrypt.hash(password, salt)

    const NewUser = await prisma.user.create({
        data: {
            username, password: hashed_password
        }
    })

    const JWT = CreateJWT(NewUser)

    // @ts-ignore 
    req.session.auth = JWT 
    res.send("User created!")
})


export default router 