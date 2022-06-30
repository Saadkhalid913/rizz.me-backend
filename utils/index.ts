import { User } from "@prisma/client";
import * as jwt from "jsonwebtoken"

export function CreateJWT(user: User) {
    return jwt.sign(user, process.env.key!)
}