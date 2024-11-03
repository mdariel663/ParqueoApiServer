import { Response } from 'express'
import ParkingModelError from '../models/Errors/ParkingModelError'
import TokenModelError from '../models/Errors/TokenModelError'
import UserModelError, { UserModelErrorAuth } from '../models/Errors/UserModelError'
import ReservaModelError from '../models/Errors/ReservaModelError'

export default class ErrorHandler {
  static handleError = (
    res: Response,
    error: Error | unknown,
    defaultMessage?: string,
    code = 500
  ): Response => {
    switch (true) {
      case error instanceof ReservaModelError:
        code = 400
        defaultMessage = error.message
        break;
      case error instanceof TokenModelError:
        code = 401
        defaultMessage = error.message
        break

      case error instanceof UserModelErrorAuth:
        code = 403
        defaultMessage = error.message
        break

      case error instanceof UserModelError ||
        error instanceof ParkingModelError:
        code = 400
        defaultMessage = error.message
        break
      default:
        defaultMessage = "Error interno del servidor"
        break
    }
    console.log('ErrorHandler: ', defaultMessage, code, error)
    return res.status(code).send({ message: defaultMessage, success: false })
  }
}
