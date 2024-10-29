import { NextFunction, Request, Response } from 'express'

// Middleware de manejo de errores
const MiddlewareErrorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError &&
    (err && 'body' in err)) {
    return res.status(400).json({ success: false, message: 'Datos JSON mal estructurados' })
  }
  return next(err)
}
export default MiddlewareErrorHandler
