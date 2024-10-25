import { Response } from 'express';


class ErrorHandler {
    static handleError(res: Response, error: string, code = 500) {
        console.error("xyz", error);
        return res.status(code).send({ "message": error , "success": false});
    }
    
    private static getErrorStatusCode(code: ErrorCode): number {
        switch (code) {
            case ErrorCode.TOKEN_NOT_FOUND:
            case ErrorCode.TOKEN_INVALID:
                return 401;
            case ErrorCode.USER_NOT_ADMIN:
                return 403;
            default:
                return 500;
        }
    }
    
}

export { ErrorMessages, ErrorCode, ErrorHandler };
