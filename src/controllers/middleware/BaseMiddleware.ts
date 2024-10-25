import { Request, Response, NextFunction } from "express";
import IMiddleware from "../../models/IMiddleware";
import ITokenModel from "../../models/ITokenModel";
import IDatabase from "../../models/Database/IDatabase";

export default class BaseMiddleware implements IMiddleware {
  constructor(
    protected readonly tokenService: ITokenModel,
    protected readonly dbSql: IDatabase
  ) {
    console.log("Middleware Inicaliced ...");
  }
  
  authorizeAdmin(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }

  onlyAutenticated(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }
}
