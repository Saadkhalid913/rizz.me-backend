import { User } from "@prisma/client";

declare namespace Express {
    export type Request = {
        _user: User
        session: { auth: string }
    }
}