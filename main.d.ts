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