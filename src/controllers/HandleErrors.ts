import { Response } from 'express'
import TokenModelError from '../models/Errors/TokenModelError'
import UserModelError, {
  UserModelErrorAuth
} from '../models/Errors/UserModelError'
import ParkingModelError from '../models/Errors/ParkingModelError'

export default class ErrorHandler {
  static handleError = (
    res: Response,
    error: Error,
    defaultMessage?: string,
    code = 500
  ) => {
    switch (true) {
      case error instanceof UserModelError ||
        error instanceof ParkingModelError:
        code = 400
        defaultMessage = error.message
        break
      case error instanceof TokenModelError:
        code = 401
        defaultMessage = error.message
        break
      case error instanceof UserModelErrorAuth:
        code = 403
        defaultMessage = error.message
        break
      default:
        defaultMessage = defaultMessage || error.message
    }

    return res.status(code).send({ message: defaultMessage, success: false })
  }
}
