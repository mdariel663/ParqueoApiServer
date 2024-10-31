import { NextFunction, Request, Response } from 'express'

// Middleware de manejo de errores
const MiddlewareErrorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction): Response | void => {
  if (err instanceof SyntaxError && ('body' in err)) {
    return res.status(400).json({ success: false, message: 'Datos JSON mal estructurados' })
  } else if (err instanceof Error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
  return next(err)
}
export default MiddlewareErrorHandler
