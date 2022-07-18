import { User } from "@prisma/client";
declare module 'express-serve-static-core' {
    interface Request {
        _user: User
        session: { auth: string }
    }
    interface Response {
        _user: User
    }
}

export type ChatCredentials = {
    anon_username: string
    anon_id: string,
    chat_id: string
    non_anon_id: string,
    sender: string,
    recipient: string
}

