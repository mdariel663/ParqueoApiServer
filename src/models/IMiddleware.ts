import { NextFunction, Request, Response } from 'express'
export default interface IMiddleware {
  authorizeStaff: (req: Request, res: Response, next: NextFunction) => void
  onlyAuthenticated: (req: Request, res: Response, next: NextFunction) => void
  authorizeAdmin: (req: Request, res: Response, next: NextFunction) => void
}

