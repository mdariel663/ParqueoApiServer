import { Request, Response, NextFunction } from "express";
import BaseMiddleware from "./BaseMiddleware";
//import UserModel from "../../models/User/UserModel";
import UserModel from "../../models/User/UserModel";
import { ErrorHandler, ErrorCode } from "../HandleErrors";
import UserModelError from "../../models/Errors/UserModelError";
import UserErrorHandler from "../errorhandlers/UserErrorHandler";
//import UserController from "../UserController";

class Middleware extends BaseMiddleware {
  authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentUserId } = req.body;
      if (!currentUserId) {
         throw new UserModelError("Usuario no encontrado o no tiene permisos");
      }

      const user = new UserModel(this.dbSql);
      const userData = await user.getCurrentUser(currentUserId);

      if (userData === null || userData === undefined) {
        throw new UserModelError("Usuario invalido o no existe");
      } else if (userData.role !== "admin") {
        throw new UserModelError("No tienes permisos para acceder a esta información");
      }
     return next();
    } catch (err: unknown) {
      console.error("Error en middleware", err);
      return UserErrorHandler.handleError(res, err, "Ha ocurrido algún error en el servidor...")
    }
  };

  onlyAutenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const currentUserId = await this.tokenService.getIdFromHeader(req);
      if (currentUserId) {
        req.body.currentUserId = currentUserId;
      }
      next();
    } catch (err: any) {
      if (
        err === ErrorCode.TOKEN_NOT_FOUND ||
        err === ErrorCode.TOKEN_INVALID
      ) {
        return ErrorHandler.handleKnownError(res, err);
      } else {
        return ErrorHandler.handleError(res, "Error desconocido del servidor");
      }
    }
  };
}

export default Middleware;
