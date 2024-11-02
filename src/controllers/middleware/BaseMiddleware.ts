// eslint-disable @/no-unused-vars
import { Request, Response, NextFunction } from 'express'
import IMiddleware from '../../models/IMiddleware'
import ITokenModel from '../../models/ITokenModel'
import IDatabase from '../../models/Database/IDatabase'

export default class BaseMiddleware implements IMiddleware {
  constructor(
    protected readonly tokenService: ITokenModel,
    protected readonly dbSql: IDatabase
  ) {
    if (process.env.NODE_ENV === 'production') {
      console.log('Middleware Iniciatialized ...')
    }
  }


  authorizeStaff(_req: Request, _res: Response, _next: NextFunction): void {
    throw new Error('Method not implemented.')
  }


  authorizeAdmin(_req: Request, _res: Response, _next: NextFunction): void {
    throw new Error('Method not implemented.')
  }

  onlyAuthenticated = (_req: Request, _res: Response, _next: NextFunction): void => {
    throw new Error('Method not implemented.')
  }
}
