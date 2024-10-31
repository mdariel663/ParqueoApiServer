/* eslint-disable */
import { Request, Response, NextFunction } from 'express'
import BaseMiddleware from './BaseMiddleware'
import UserModel from '../../models/User/UserModel'
import ErrorHandler from '../HandleErrors'
import UserModelError, { UserModelErrorAuth } from '../../models/Errors/UserModelError'
import { UUID } from 'crypto'
import UserLogged from '../../models/User/UserInterface'


class Middleware extends BaseMiddleware {
  authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { currentUserId } = req.body as { currentUserId: UUID }

      if (currentUserId === null || currentUserId === undefined) {
        throw new UserModelError('Usuario no encontrado o no tiene permisos')
      }

      const user: UserModel = new UserModel()
      const userData: UserLogged | null = await user.getCurrentUser(currentUserId)

      if (userData === null || userData === undefined) {
        throw new UserModelError('Usuario invalido o no existe')
      } else if (userData.role !== 'admin') {
        throw new UserModelError('No tienes permisos para acceder a esta información')
      }
      return next()
    } catch (err: unknown) {
      return ErrorHandler.handleError(res, err, 'Ha ocurrido algún error en el servidor...')
    }
  }


  onlyAuthenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const currentUserId = await this.tokenService.getIdFromHeader(req)
      console.log("currentUserId", currentUserId)

      const user: UserModel = new UserModel()
      const userData: UserLogged | null = await user.getCurrentUser(currentUserId)

      if (currentUserId === null || currentUserId === undefined || userData === null) {
        throw new UserModelErrorAuth('Usuario no autenticado')
      }

      req.body.currentUserId = currentUserId

      return next()
    } catch (err: unknown) {
      return ErrorHandler.handleError(res, err, 'Error desconocido del servidor')
    }
  }
}

export default Middleware
