import express from "express"
import bcrypt from "bcrypt"
import prisma from "../../db"

const router = express.Router()


router.post("/create", async (req,res) => {
    const { username, password } = req.body


    const salt = await bcrypt.genSalt()
    const hashed_password = await bcrypt.hash(password, salt)

    const NewUser = prisma.user.create({
        data: {
            username, password: hashed_password
        }
    })
})