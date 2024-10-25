import TokenService from "../../services/TokenService";
import { randomUUID, UUID } from "crypto";
import IDatabase from "../Database/IDatabase";
import EmailRequest from "./EmailRequest";
import PasswordRequest from "./PasswordRequest";
import RoleRequest from "./RoleRequest";
import UserNameRequest from "./UserNameRequest";
import controllers from "../../controllers/controllers";
import UserModelError from "../Errors/UserModelError";
import PhoneRequest from "./PhoneRequest";

class UserModel {
  constructor(
    private readonly db: IDatabase = controllers.databaseRepository
  ) {}

  async getUsers() {
    return await this.db.all(
      "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY updated_at",
      []
    );
  }
  async getCurrentUser(userId: UUID) {
    const [user] = await this.db.get(
      "SELECT name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );
    if (!user) throw new UserModelError("Usuario sin permisos o innexistente");
    return user;
  }

  async getUserById(userId: UUID) {
    const user = await this.db.get("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return user ? user[0] : null;
  }

  async checkLogin(
    credentialRequest: EmailRequest | PhoneRequest,
    passwordRequest: PasswordRequest
  ): Promise<any> {
    const isEmail = credentialRequest instanceof EmailRequest;
    const paramType = isEmail ? "email" : "phone";
    const value = isEmail ? credentialRequest.email : (credentialRequest as PhoneRequest).phone;
  
    const query = `SELECT id, password FROM users WHERE ${paramType} = ?`;
    const [result] = await this.db.get(query, [value]);
    
    

    if (!result) return null;
    const isPasswordValid = await passwordRequest.verifyPassword( result.password );

    if (isPasswordValid) {
      const token = new TokenService();
      return { id: result.id, token: token.generateToken(result.id) };
    }
    return null;
  }

  async create({
    name,
    email,
    phone,
    password,
    role,
  }: {
    name: UserNameRequest;
    email: EmailRequest;
    phone: PhoneRequest;
    password: PasswordRequest;
    role: RoleRequest;
  }) {
    const userId = randomUUID();
    try {
      await this.db.run(
        "INSERT INTO users (id, name, email, phone, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [
          userId,
          name.name,
          email.email,
          phone.phone,
          await password.encryptPassword(),
          role.role,
        ]
      );
      return { id: userId, name: name.name, email: email.email, phone: phone.phone };
    } catch (error: any) {
      if (error?.code === "ER_DUP_ENTRY")
        throw new UserModelError("El usuario ya existe");
      throw error;
    }
  }

  async updateUser(
    userId: UUID,
    userData: {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    }
  ) {
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (userData.name !== undefined) {
      fieldsToUpdate.push("name = ?");
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      fieldsToUpdate.push("email = ?");
      values.push(userData.email);
    }
    if (userData.password !== undefined) {
      fieldsToUpdate.push("password = ?");
      values.push(userData.password);
    }
    if (userData.role !== undefined) {
      fieldsToUpdate.push("role = ?");
      values.push(userData.role);
    }
    if (userData.phone !== undefined) {
      fieldsToUpdate.push("phone = ?");
      values.push(userData.phone);
    }

    if (fieldsToUpdate.length === 0) {
      return null;
    }

    const query = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
    values.push(userId);
    return await this.db.run(query, values);
  }

  async deleteUser(userId: UUID) {
    return await this.db.run("DELETE FROM users WHERE id = ?", [userId]);
  }
}

export default UserModel;
