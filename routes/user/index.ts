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
        res.send({"message": "new user created"})
    } 
    catch(err) {
        res.status(402).send("User Already Exists")
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
        console.log("---- session in route ----", req.session)
    }
    else {
        return res.status(400).send({"Message": "Incorrect password"})
    }
})

router.get("/test", auth, async (req,res) => {
    // @ts-ignore 
    res.send({"message": "you made it to the logged in route!", creds: req._user})
})

router.get("/get-cookie",  async (req,res) => {
    res.cookie("testCookie", {test: "hello"}, {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "none",
        secure: true,
        httpOnly: true,
        domain: process.env.cookie_domain
    })
    res.send("Cookie Sent")
})

router.get("/test-cookie",  async (req,res) => {
    const cookies = req.cookies;
    console.log("Cookies ----------- \n", cookies)
    res.send(cookies)
})


export default router 