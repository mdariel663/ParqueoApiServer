import UserModel from "../models/User/UserModel";
import EmailRequest from "../models/User/EmailRequest";
import PasswordRequest from "../models/User/PasswordRequest";
import RoleRequest from "../models/User/RoleRequest";
import UserNameRequest from "../models/User/UserNameRequest";
import { UUID } from "crypto";
import UserModelError from "../models/Errors/UserModelError";
import PhoneRequest from "../models/User/PhoneRequest";

class UserService {
    static async deleteUser(currentUserId: UUID, userDeleteId: UUID) {
        const userModel = new UserModel();
        const currentUser = await userModel.getCurrentUser(currentUserId);
        if (!currentUser || currentUser.role !== "admin") {
            throw new UserModelError("No se puede eliminar un usuario si usted no es administrador");
        }
        const userData = await userModel.getUserById(userDeleteId);
        if (!userData) throw new UserModelError("El usuario no existe");
        await userModel.deleteUser(userDeleteId);
        return { success: true, message: "Usuario eliminado", userId: userDeleteId };
    }

    static async createUser({ name, email, phone, password, role }: { name: string, email: string,phone: string, password: string, role: string }) {
        const userModel = new UserModel();
        const requestData = {
            name: new UserNameRequest(name),
            email: new EmailRequest(email),
            phone: new PhoneRequest(phone),
            password: new PasswordRequest(password),
            role: new RoleRequest(role),
        };

        (Object.keys(requestData) as (keyof typeof requestData)[]).forEach((key) => {
            if (requestData[key].messageError) {
                throw new UserModelError(requestData[key].messageError);
            }
        });
        

        const user = await userModel.create(requestData);
        return { success: true, user };
    }

    static async updateUser(userId: UUID, name?: string, email?: string, phone?: string, password?: string, role?: string) {
        const userModel = new UserModel();
        return await userModel.updateUser(userId, { name, email, phone, password, role });
    }

    static async getCurrentUser(userId: UUID) {
        const userModel = new UserModel();
        const user = await userModel.getCurrentUser(userId);
        if (!user) throw new UserModelError("Usuario actual no encontrado");
        return user;
    }

    static async getUsers() {
        const userModel = new UserModel();
        return await userModel.getUsers();
    }

    static async loginUser(email: string, password: string) {
        const emailRequest = new EmailRequest(email);
        const passwordRequest = new PasswordRequest(password);

        if (!emailRequest.isValid || !passwordRequest.isValid) {
            throw new UserModelError("Los campos email y password son obligatorios");
        }
        
        const userModel = new UserModel();
        const user = await userModel.checkLogin(emailRequest, passwordRequest);
        if (!user) throw new UserModelError("El usuario no existe o la contraseña es incorrecta");
        return { success: true, message: "Usuario autenticado", ...user };
    }
}

export default UserService;
