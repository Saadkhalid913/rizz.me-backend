import { Request, Response, NextFunction, RequestHandler, Errback } from "express";
import { IsTesting } from "../utils";
import { HTTPError } from "./errors";



export const handlerWrapper = (handler: RequestHandler): RequestHandler => {
    return async (req: Request,res: Response,next: NextFunction) => {
        try {
            await handler(req,res,next)
        }
        catch (err) {
            next(err)
        }
    }
}

export const errorMiddlewear = (err: HTTPError, req: Request, res: Response, next: NextFunction) => {
    const { HTTPErrorCode, environment, routePath, endUserMessage } = err.info;
    (!IsTesting()) && console.log(`${HTTPErrorCode} ERROR AT ${routePath} -- "${endUserMessage} ENV: ${environment}"`)
    res.status(HTTPErrorCode).send({error: endUserMessage})
}