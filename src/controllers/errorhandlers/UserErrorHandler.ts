import UserModelError from "../../models/Errors/UserModelError";
import { ErrorHandler } from "../HandleErrors";
import express from "express"

export default class UserErrorHandler {
    static handleError(resp: express.Response, err: unknown, defaultMessage = "Error interno del servidor") {
        if (err instanceof UserModelError) {
            return ErrorHandler.handleError(resp, err.message, 400);
        }
        return ErrorHandler.handleError(resp, defaultMessage, 500);
    }
}