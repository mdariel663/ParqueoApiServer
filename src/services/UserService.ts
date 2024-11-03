import UserModel from "../models/User/UserModel";
import EmailRequest from "../models/User/EmailRequest";
import PasswordRequest from "../models/User/PasswordRequest";
import RoleRequest from "../models/User/RoleRequest";
import UserNameRequest from "../models/User/UserNameRequest";
import { UUID } from "crypto";
import PhoneRequest from "../models/User/PhoneRequest";
import UserFilterModel from "../models/UserFilterModel";
import User from "../models/User/UserInterface";
import UserResponse, { UserLoginResponse } from "../models/User/UserResponse";
import UserLogged from "../models/User/UserInterface";
import LoggerController, { defaultEntryLog } from "../controllers/LoggerController";
import UserModelError, { UserModelErrorAuth } from "../models/Errors/UserModelError";

class UserService {
  static async deleteUser(currentUserId: UUID, userDeleteId: UUID | undefined): Promise<{ success: boolean; message: string; userId: UUID }> {
    const userModel: UserModel = new UserModel();
    const currentUser: UserLogged | null = await userModel.getCurrentUser(currentUserId);

    // Verifica si currentUser es nulo antes de acceder a su rol
    if (!currentUser) {
      throw new UserModelError("Usuario actual no encontrado");
    }

    if (userDeleteId === undefined) {
      userDeleteId = currentUserId;
    } else if (currentUser.role !== "admin") {
      throw new UserModelError("No se puede eliminar un usuario si usted no es administrador.");
    }

    const userData = await userModel.getUserById(userDeleteId);

    if (userData === null) {
      LoggerController.sendLog({
        ...defaultEntryLog,
        message: "Se intento eliminar un usuario que no existe",
        action: "Eliminar Usuario",
        resource: "user",
        details: {
          userId: userDeleteId,
          action: "Eliminar Usuario",
          description: "Se intento eliminar un usuario que no existe"
        }
      })
      throw new UserModelError("El usuario no existe");
    }

    await userModel.deleteUser(userDeleteId);
    LoggerController.sendLog({
      ...defaultEntryLog,
      message: "Usuario eliminado",
      action: "Eliminar Usuario",
      resource: "user",
      details: {
        userId: userDeleteId,
        action: "Eliminar Usuario",
        description: "Se intento eliminar un usuario"
      }
    })
    return {
      success: true,
      message: "Usuario eliminado",
      userId: userDeleteId,
    };
  }


  static createUser = async ({
    name,
    email,
    phone,
    password,
    role
  }: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<{
    success: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    }
  }> => {
    const userModel: UserModel = new UserModel();
    const requestData = {
      name: new UserNameRequest(name),
      email: new EmailRequest(email),
      phone: new PhoneRequest(phone),
      password: new PasswordRequest(password),
      role: new RoleRequest(role),
    };

    // Verificar si hay errores en los datos
    (Object.keys(requestData) as (keyof typeof requestData)[]).forEach((key) => {
      if (requestData[key].messageError) {
        throw new UserModelError(requestData[key].messageError);
      }
    });

    const userExists = await UserService.userExists(email, phone);
    if (userExists) {
      throw new UserModelError('El correo electrónico o el teléfono ya están en uso.');
    }
    // Crear el usuario en la base de datos
    const user = await userModel.create(requestData);

    LoggerController.sendLog({
      ...defaultEntryLog,
      message: "Usuario creado",
      action: "Crear Usuario",
      resource: "user",
      details: {
        userId: user.id,
        action: "Crear Usuario",
        description: "Se intento crear un usuario"
      }
    })
    if (role === "admin") {
      LoggerController.sendLog({
        ...defaultEntryLog,
        level: "warn",
        message: "Usuario creado como admin",
        action: "Crear Usuario",
        resource: "user",
        details: {
          userId: user.id,
          action: "Crear Usuario",
          description: "Se intento crear un usuario como admin"
        }
      })
    }
    return { success: true, user: user };
  }



  static async userExists(email: string, phone: string): Promise<boolean> {
    const userModel: UserModel = new UserModel();
    const filter: UserFilterModel = new UserFilterModel({ "email": email, "phone": phone });
    const user: unknown[] | null = await userModel.findUserByFilter(email, phone, filter);
    return user === null;
  }

  static async updateUser(
    userId: UUID,
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    role?: string
  ): Promise<{ affectedRows: number } | null> {
    const userModel: UserModel = new UserModel();
    const awaitUser = await userModel.updateUser(userId, {
      name,
      email,
      phone,
      password,
      role,
    });

    if (awaitUser && awaitUser?.affectedRows > 0) {
      LoggerController.sendLog({
        ...defaultEntryLog,
        message: "Usuario actualizado",
        action: "Actualizar Usuario",
        resource: "user",
        details: {
          userId: userId,
          action: "Actualizar Usuario",
          description: "Se intento actualizar un usuario"
        }
      })
    } else {
      LoggerController.sendLog({
        ...defaultEntryLog,
        level: "error",
        message: "Error al actualizar usuario",
        action: "Actualizar Usuario",
        resource: "user",
        details: {
          userId: userId,
          action: "Actualizar Usuario",
          description: "Se intento actualizar un usuario"
        }
      })
    }
    return awaitUser;
  }

  static getCurrentUser = async (userId: UUID): Promise<UserLogged> => {
    const userModel: UserModel = new UserModel();
    const user = await userModel.getCurrentUser(userId);
    if (user === null) {
      throw new UserModelError("Usuario actual no encontrado");
    }
    return user;
  }

  static getUsers = async (): Promise<User[]> => {
    const userModel: UserModel = new UserModel();
    return await userModel.getUsers();
  }

  static loginUser = async (email: string | undefined, phone: string | undefined, password: string): Promise<UserLoginResponse> => {
    if (!password || (email !== undefined && phone !== undefined)) {
      throw new UserModelError(
        "Los campos email o phone y password son obligatorios"
      );
    }


    const emailRequest: EmailRequest | null = (email !== undefined) ? new EmailRequest(email) : null;
    const phoneRequest: PhoneRequest | null = (phone !== undefined) ? new PhoneRequest(phone) : null;
    const passwordRequest: PasswordRequest = new PasswordRequest(password);

    if (emailRequest?.isValid === true && phoneRequest?.isValid === true) {
      throw new UserModelError("No puedes usar ambos email y phone, solo uno");
    }
    if (emailRequest && !emailRequest.isValid) {
      throw new UserModelError("El formato de email no es válido");
    }

    if (phoneRequest && !phoneRequest.isValid) {
      throw new UserModelError("El formato de phone no es válido");
    }

    if (!passwordRequest.isValid) {
      throw new UserModelError(passwordRequest.messageError);
    }

    const userModel: UserModel = new UserModel();
    const user: UserResponse | null =
      await userModel.checkLogin(
        emailRequest ?? phoneRequest,
        passwordRequest).then((user: UserResponse | null) => {
          if (user === null) {
            throw new UserModelErrorAuth(
              "El usuario no existe o la contraseña es incorrecta"
            );
          }
          return user;

        }).catch((_e: unknown) => {
          if (emailRequest) {
            LoggerController.sendLog({
              ...defaultEntryLog,
              message: "Error al intentar autenticar usuario",
              action: "Login",
              resource: "user",
              details: {
                userId: emailRequest.email,
                action: "Login",
                description: "Error al intentar autenticar usuario"
              }
            })
          } else if (phoneRequest) {
            LoggerController.sendLog({
              ...defaultEntryLog,
              message: "Error al intentar autenticar usuario",
              action: "Login",
              resource: "user",
              level: "error",
              details: {
                userId: phoneRequest.phone,
                action: "Login",
                description: "Error al intentar autenticar usuario"
              }
            })
          }
          throw new UserModelErrorAuth(
            "El usuario no existe o la contraseña es incorrecta"
          );
        });

    return { success: true, message: "Usuario autenticado", ...user };
  }
}

export default UserService;
