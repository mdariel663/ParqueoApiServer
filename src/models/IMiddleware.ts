import { NextFunction, Request, Response } from "express";
interface IMiddleware {
  onlyAutenticated(req: Request, res: Response, next: NextFunction): void;
  authorizeAdmin (req: Request, res: Response, next: NextFunction): void
}

export default IMiddleware;
