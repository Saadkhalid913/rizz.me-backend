import { Request, Response, NextFunction, RequestHandler, Errback } from "express";
import { HTTPError } from "./errors";



const authMiddlewear = (handler: RequestHandler): RequestHandler => {
    return (req: Request,res: Response,next: NextFunction) => {
        try {
            handler(req,res,next)
        }
        catch (err) {
            next(err)
        }
    }
}

export const errorMiddlewear = (err: HTTPError, req: Request, res: Response, next: NextFunction) => {
    const { HTTPErrorCode, environment, routePath, endUserMessage } = err.info
    console.log(`${HTTPErrorCode} ERROR AT ${routePath} -- "${endUserMessage} ENV: ${environment}"`)
    res.status(HTTPErrorCode).send({error: endUserMessage})
}