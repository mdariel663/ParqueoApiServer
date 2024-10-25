import { Request, Response, NextFunction } from "express";
import BaseMiddleware from "./BaseMiddleware";
//import UserModel from "../../models/User/UserModel";
import UserModel from "../../models/User/UserModel";
import ErrorHandler from "../HandleErrors";
import UserModelError, { UserModelErrorAuth } from "../../models/Errors/UserModelError";
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
    } catch (err: any) {
      return ErrorHandler.handleError(res, err, "Ha ocurrido algún error en el servidor...")
    }
  };
  onlyAutenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const currentUserId = await this.tokenService.getIdFromHeader(req);
      if (!currentUserId) {
        throw new UserModelErrorAuth("Usuario no autenticado");
      }
      req.body.currentUserId = currentUserId;
      return next();
    } catch (err: any) {
      return ErrorHandler.handleError(res, err, "Error desconocido del servidor");
    }
  };
  
}

export default Middleware;
