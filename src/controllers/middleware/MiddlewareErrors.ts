import { NextFunction, Request, Response } from "express";

// Middleware de manejo de errores
const MiddlewareErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ success: false, message: "Datos JSON mal estructurados" });
    }
    next(err);
    return;
  }
  export default MiddlewareErrorHandler;