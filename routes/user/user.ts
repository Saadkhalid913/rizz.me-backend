import express from "express"
import bcrypt from "bcrypt"
import prisma from "../../db"
import { CreateJWT } from "../../utils"
import auth from "../../middlewear/auth"

const router = express.Router()



router.post("/", async (req: express.Request<any>,res: express.Response) => {
    const { username, password } = req.body

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
        console.log(req.session)
        res.send({"message": "new user created"})
    } 
    catch(err) {
        console.log("error")
    }

})

router.post("/login", async (req: express.Request<any>,res: express.Response) => {
    const { username, password } = req.body


    const user = await prisma.user.findUnique({where: {username}})
    if (!user) return res.status(401).send({"message": "no user found"})
    const valid = await bcrypt.compare(password, user.password)
    if (valid) {
        // @ts-ignore 
        req.session.auth = CreateJWT(user)
        console.log(req.session)
    }
    else {
        return res.status(400).send({"Message": "Incorrect password"})
    }
})

router.get("/test", auth, async (req,res) => {
    // @ts-ignore 
    res.send({"message": "you made it to the logged in route!", creds: req._user})
})


export default router 