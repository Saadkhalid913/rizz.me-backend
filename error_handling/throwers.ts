import { HTTPError } from "./errors"
import express from "express"

export function missingFieldError(field: string, req: express.Request, routePath:string) {
    throw new HTTPError(`Field not found: ${field}`, {
        HTTPErrorCode: 402,
        endUserMessage: `Field not found: ${field}`,
        routePath,
        resource: req
    })
}