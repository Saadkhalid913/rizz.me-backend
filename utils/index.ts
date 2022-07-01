import { User } from "@prisma/client";
import * as jwt from "jsonwebtoken"

export function CreateJWT(user: User) {
    return jwt.sign(user, process.env.key!)
}

export function IsTesting(): Boolean {
    return process.env.NODE_ENV == "test" ? true : false
}
export function IsDev(): Boolean {
    return process.env.TS_NODE_DEV ? true : false
}