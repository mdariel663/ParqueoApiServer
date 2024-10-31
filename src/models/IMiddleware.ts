import { NextFunction, Request, Response } from 'express'
export default interface IMiddleware {
  onlyAuthenticated: (req: Request, res: Response, next: NextFunction) => void
  authorizeAdmin: (req: Request, res: Response, next: NextFunction) => void
}

