import express from 'express'
import UserService from '../services/UserService'
import ErrorHandler from './HandleErrors'
import { validateFields } from './Utils'
import EmailRequest from '../models/User/EmailRequest'
import PasswordRequest from '../models/User/PasswordRequest'
import UserNameRequest from '../models/User/UserNameRequest'
import RoleRequest from '../models/User/RoleRequest'
import UserModel from '../models/User/UserModel'
import UserModelError, { UserModelErrorBadRequest } from '../models/Errors/UserModelError'
import PhoneRequest from '../models/User/PhoneRequest'

class UserController {
  static delete = async (req: express.Request, resp: express.Response) => {
    try {
      const { currentUserId, userId } = req.body
      const result = await UserService.deleteUser(currentUserId, userId)
      return resp.status(200).send(result)
    } catch (err: any) {
      return ErrorHandler.handleError(
        resp,
        err,
        'Error al eliminar usuario'
      )
    }
  }
  static create = async (req: express.Request, resp: express.Response) => {
    try {
      const { name, email, phone, password, role } = req.body;
      let roleObject: string = role;
      const validationError = validateFields({ name, email, phone, password });

      if (validationError) {
        throw new UserModelErrorBadRequest(validationError);
      }

      const validationRolError = validateFields({ role });

      if (role === undefined) {
        roleObject = 'cliente';
      } else if (validationRolError) {
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
    } catch (err: any) {
      console.log('error', err)
      return ErrorHandler.handleError(resp, err, 'Error al crear usuario');
    }
  };

  static update = async (req: express.Request, resp: express.Response) => {
    try {
      const {
        currentUserId,
        userId: reqUserId,
        name,
        email,
        phone,
        password,
        role
      } = req.body

      const userId = reqUserId || currentUserId
      const model = new UserModel()
      const user = await model.getCurrentUser(currentUserId)

      let isModificableRole = false
      if (user.role === 'admin') {
        isModificableRole = true
      }
      if (!isModificableRole && role !== undefined) {
        throw new UserModelError('No se puede modificar el rol de un usuario que no es administrador')
      }

      const validatedData: {
        name?: string
        email?: string
        phone?: string
        password?: string
        role?: string
      } = {}

      // Definir las claves permitidas explícitamente en TypeScript
      type ValidatedDataKeys = 'name' | 'email' | 'phone' | 'password' | 'role'

      const validateField = (
        RequestClass: any,
        value: string,
        field: ValidatedDataKeys
      ) => {
        const request = new RequestClass(value)

        if (!request.isValid) {
          throw new UserModelError(request.messageError)
        }
        validatedData[field] = request[field]
        return true
      }

      // Validaciones de los campos opcionales
      if (name) validateField(UserNameRequest, name, 'name')
      if (email) validateField(EmailRequest, email, 'email')
      if (phone) validateField(PhoneRequest, phone, 'phone')
      if (password) validateField(PasswordRequest, password, 'password')
      if (isModificableRole && role !== undefined) { validateField(RoleRequest, role, 'role') }

      // Actualizar usuario
      const result = await UserService.updateUser(
        userId,
        validatedData.name,
        validatedData.email,
        validatedData.phone,
        validatedData.password,
        validatedData.role
      )
      return resp
        .status(200)
        .send({
          message: 'Usuario actualizado con éxito',
          ...validatedData,
          success: result.affectedRows > 0
        })
    } catch (err: any) {
      return ErrorHandler.handleError(resp, err, 'Error al actualizar usuario', 500)
    }
  }

  static getCurrent = async (req: express.Request, resp: express.Response) => {
    try {
      const { currentUserId } = req.body
      const result = await UserService.getCurrentUser(currentUserId)
      return resp.status(200).send({ success: true, ...result })
    } catch (err: any) {
      return ErrorHandler.handleError(
        resp,
        err,
        'Error al obtener usuario'
      )
    }
  }

  static getUsers = async (_: express.Request, resp: express.Response) => {
    try {
      const result = await UserService.getUsers()
      return resp.status(200).send(result)
    } catch (err: any) {
      return ErrorHandler.handleError(resp, err, 'Error al obtener usuarios', 500)
    }
  }

  static login = async (req: express.Request, resp: express.Response) => {
    try {
      const { email, phone, password } = req.body
      const result = await UserService.loginUser(email, phone, password)
      return resp.status(200).send(result)
    } catch (err: any) {
      return ErrorHandler.handleError(resp, err, 'Error interno del servidor', 500)
    }
  }
}

export default UserController
