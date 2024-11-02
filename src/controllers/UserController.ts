import express from 'express'
import UserService from '../services/UserService'
import ErrorHandler from './HandleErrors'
import { validateFields } from './Utils'
import EmailRequest from '../models/User/EmailRequest'
import PasswordRequest from '../models/User/PasswordRequest'
import UserNameRequest from '../models/User/UserNameRequest'
import RoleRequest from '../models/User/RoleRequest'
import UserModel from '../models/User/UserModel'
import PhoneRequest from '../models/User/PhoneRequest'
import { UUID } from 'crypto'
import { UserLoginResponse } from '../models/User/UserResponse'
import LoggerController from './LoggerController'
import UserModelError, { UserModelErrorBadRequest } from '../models/Errors/UserModelError'

interface DeleteUserRequestBody {
  currentUserId: UUID;
  userId?: UUID; // userId es opcional
}

interface CreateUserRequestBody {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

interface UpdateRequestBody {
  currentUserId: UUID;
  userId?: UUID; // userId es opcional
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
}

interface LoginRequestBody {
  email: string;
  phone: string;
  password: string;
}

class UserController {
  static delete = async (req: express.Request, resp: express.Response): Promise<express.Response> => {
    try {
      const { userIdDelete } = req.params as { userIdDelete: UUID };
      console.log("userIdDelete", userIdDelete)
      const { currentUserId } = req.body as { currentUserId: UUID };
      const result = await UserService.deleteUser(currentUserId, userIdDelete)
      return resp.status(200).send(result)
    } catch (err: unknown) {
      return ErrorHandler.handleError(
        resp,
        err,
        'Error al eliminar usuario'
      )
    }
  }
  static create = async (req: express.Request, resp: express.Response): Promise<express.Response> => {
    try {
      const { name, email, phone, password, role } = req.body as CreateUserRequestBody;
      let roleObject: string = role;
      const validationError = validateFields({ name, email, phone, password });

      if (validationError !== null) {
        throw new UserModelErrorBadRequest(validationError);
      }

      const validationRolError = validateFields({ role });

      if (role === undefined) {
        roleObject = 'cliente';
      } else if (validationRolError !== null) {
        throw new UserModelError(validationRolError);
      }

      const result = await UserService.createUser({
        name,
        email,
        phone,
        password,
        role: roleObject
      });
      return resp.status(200).send(result);
    } catch (err: unknown) {
      return ErrorHandler.handleError(resp, err, 'Error al crear usuario');
    }
  };


  static update = async (req: express.Request, resp: express.Response): Promise<express.Response> => {
    try {
      const {
        currentUserId,
        userId: reqUserId,
        name,
        email,
        phone,
        password,
        role
      } = req.body as UpdateRequestBody;

      // Ensure userId is either a string or undefined
      const userId = reqUserId ?? currentUserId;

      const model = new UserModel();
      const user = await model.getCurrentUser(currentUserId);

      if (user === null) {
        throw new UserModelError('Usuario no encontrado');
      }

      const isModificableRole = user.role === 'admin';

      if (!isModificableRole && role !== undefined) {
        throw new UserModelError('No se puede modificar el rol de un usuario que no es administrador');
      }

      const validatedData: {
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        role?: string;
      } = {};

      type ValidatedDataKeys = 'name' | 'email' | 'phone' | 'password' | 'role';

      interface ValidatableRequest {
        isValid: boolean;
        messageError?: string;
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        password?: string;
        role?: string | null;
      }

      const validateField = <T extends ValidatableRequest>(
        RequestClass: new (value: string) => T,
        value: string | null,  // Accept null
        field: ValidatedDataKeys
      ): void => {
        if (value === null) return;  // Skip if null

        const request = new RequestClass(value);

        if (!request.isValid) {
          throw new UserModelError(request.messageError ?? 'Error de validación');
        }

        validatedData[field] = request[field] ?? undefined; // Now this line is safe
      };

      // Validaciones de los campos opcionales
      if (name !== undefined) validateField(UserNameRequest, name, 'name');
      if (email !== undefined) validateField(EmailRequest, email, 'email');
      if (phone !== undefined) validateField(PhoneRequest, phone, 'phone');
      if (password !== undefined) validateField(PasswordRequest, password, 'password');
      if (isModificableRole && role !== undefined) {
        validateField(RoleRequest, role, 'role');
      }

      // Actualizar usuario
      const result = await UserService.updateUser(
        userId,
        validatedData.name,
        validatedData.email,
        validatedData.phone,
        validatedData.password,
        validatedData.role
      );

      if (result === null) {
        throw new UserModelError('Error al actualizar usuario');
      }

      return resp.status(200).send({
        message: 'Usuario actualizado con éxito',
        ...validatedData,
        success: (result.affectedRows > 0),
      });
    } catch (err) {
      return ErrorHandler.handleError(resp, err, 'Error al actualizar usuario', 500);
    }
  };


  static getCurrent = async (req: express.Request, resp: express.Response): Promise<express.Response> => {
    try {
      const { currentUserId } = req.body as { currentUserId: UUID };
      const result = await UserService.getCurrentUser(currentUserId)
      return resp.status(200).send({ success: true, ...result })
    } catch (err: unknown) {
      return ErrorHandler.handleError(
        resp,
        err,
        'Error al obtener usuario'
      )
    }
  }

  static getUsers = async (_: express.Request, resp: express.Response): Promise<express.Response> => {
    try {
      const result = await UserService.getUsers()
      return resp.status(200).send(result)
    } catch (err: unknown) {
      return ErrorHandler.handleError(resp, err, 'Error al obtener usuarios', 500)
    }
  }

  static login = async (req: express.Request, resp: express.Response): Promise<express.Response> => {
    const { email, phone, password } = req.body as LoginRequestBody;

    try {
      const result: UserLoginResponse = await UserService.loginUser(email, phone, password)
      LoggerController.sendLogin(result.id, true)
      return resp.status(200).send(result)
    } catch (err: unknown) {
      LoggerController.sendLogin(email ?? phone, false)
      return ErrorHandler.handleError(resp, err, 'Error interno del servidor', 500)
    }
  }
}

export default UserController
