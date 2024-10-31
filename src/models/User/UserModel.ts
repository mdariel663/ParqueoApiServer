
import TokenService from '../../services/TokenService'
import { randomUUID, UUID } from 'crypto'
import IDatabase from '../Database/IDatabase'
import EmailRequest from './EmailRequest'
import PasswordRequest from './PasswordRequest'
import RoleRequest from './RoleRequest'
import UserNameRequest from './UserNameRequest'
import controllers from '../../controllers/controllers'
import UserModelError from '../Errors/UserModelError'
import PhoneRequest from './PhoneRequest'
import FilterModel from '../FilterModel'
import User from './UserInterface'
import UserResponse from './UserResponse'
import UserLogged from './UserInterface'
export class UserFilterModel extends FilterModel { }

class UserModel {
  constructor(
    private readonly db: IDatabase = controllers.databaseRepository
  ) { }

  getUsers = async (): Promise<User[]> => {
    return await this.db.all(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY updated_at',
      []
    )
  }

  getCurrentUser = async (userId: UUID): Promise<UserLogged | null> => {
    const user = await this.db.get<UserLogged>(
      'SELECT name, email, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    )
    console.log("Test getCurrentUser")
    console.log("userId", userId)
    console.log("user", user)
    if (user === undefined) {
      throw new UserModelError('Usuario sin permisos o innexistente')
    }
    return user
  }

  async getUserById(userId: UUID | undefined): Promise<User | null> {
    if (userId === undefined) {
      throw new UserModelError('ID de usuario no proporcionado');
    }
    const user = await this.db.get<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);

    if (user !== undefined) {
      return user;
    }
    return null;
  }
  async checkLogin(
    credentialRequest: EmailRequest | PhoneRequest | null,
    passwordRequest: PasswordRequest
  ): Promise<UserResponse | null> {
    if (credentialRequest === null) {
      return null
    }
    const isEmail = credentialRequest instanceof EmailRequest
    const paramType = isEmail ? 'email' : 'phone'
    const value = isEmail ? credentialRequest.email : (credentialRequest).phone

    const query = `SELECT id, password FROM users WHERE ${paramType} = ?`
    const result = await this.db.get<{ id: UUID, password: string }>(query, [value])

    if (result === null) return null

    const isPasswordValid = await passwordRequest.verifyPassword(result.password)

    if (isPasswordValid) {
      const token = new TokenService()
      return { id: result.id, token: token.generateToken(result.id) }
    }
    return null
  }

  async create({
    name,
    email,
    phone,
    password,
    role
  }: {
    name: UserNameRequest;
    email: EmailRequest;
    phone: PhoneRequest;
    password: PasswordRequest;
    role: RoleRequest;
  }): Promise<{ id: string; name: string; email: string; phone: string }> {
    const userId = randomUUID()
    try {
      const result = await this.db.run(
        'INSERT INTO users (id, name, email, phone, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          userId,
          name.name,
          email.email,
          phone.phone,
          await password.encryptPassword(),
          role.role
        ]
      );

      if (result?.affectedRows > 0) {
        return {
          id: userId as string,
          name: name.name,
          email: email.email as string,
          phone: phone.phone as string
        };
      } else {
        throw new UserModelError('Error al crear el usuario');
      }
    } catch (error: unknown) {
      if (error instanceof UserModelError) {
        throw error;
      } else if ((error as { code: string }).code === 'ER_DUP_ENTRY') {
        throw new UserModelError('El usuario ya existe');
      } else {
        throw new UserModelError('Error desconocido');
      }
    }
  }


  async findUserByFilter(user: string, password: string, filterModel: FilterModel, limit: number = 1): Promise<unknown[] | null> {
    const result = await this.db.get<Array<unknown>>(
      `SELECT ${filterModel.getFieldsToSelect()} FROM users WHERE email = ? OR phone = ? LIMIT ${limit}`,
      [user, password]
    );
    console.log("result", result)
    return [result]; //Return userId is found
  }

  updateUser = async (
    userId: UUID,
    userData: {
      name?: string
      email?: string
      phone?: string
      password?: string
      role?: string
    }
  ): Promise<{ affectedRows: number } | null> => {
    const fieldsToUpdate: string[] = []
    const values: unknown[] = []

    if (userData.name !== undefined) {
      fieldsToUpdate.push('name = ?')
      values.push(userData.name)
    }
    if (userData.email !== undefined) {
      fieldsToUpdate.push('email = ?')
      values.push(userData.email)
    }
    if (userData.password !== undefined) {
      fieldsToUpdate.push('password = ?')
      values.push(userData.password)
    }
    if (userData.role !== undefined) {
      fieldsToUpdate.push('role = ?')
      values.push(userData.role)
    }
    if (userData.phone !== undefined) {
      fieldsToUpdate.push('phone = ?')
      values.push(userData.phone)
    }

    if (fieldsToUpdate.length === 0) {
      return null
    }

    const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`
    values.push(userId)
    return await this.db.run(query, values)
  }

  // async deleteUser(userId: UUID) {
  //  return await this.db.run('DELETE FROM users WHERE id = ?', [userId])
  //}

  async deleteUser(userId: UUID): Promise<void> {
    const result = await this.db.run('DELETE FROM users WHERE id = ?', [userId])
    if (result.affectedRows === 0) {
      throw new UserModelError('Usuario no encontrado para eliminar');
    }
  }
}

export default UserModel
