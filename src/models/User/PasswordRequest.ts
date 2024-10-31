import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

export default class PasswordRequest {
  public messageError: string = ''
  public isValid: boolean = true

  constructor(public password: string | undefined) {
    if (password === undefined) {
      this.isValid = false
      this.messageError = 'El campo password es obligatorio'
    } else if (password.length < 8) {
      this.isValid = false
      this.messageError = 'La contraseña debe tener al menos 8 caracteres'
    }
  }

  async encryptPassword(): Promise<string> {
    if (this.isValid === false) {
      throw new Error(this.messageError)
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10")
    const hash = await bcrypt.hash(this.password as string, saltRounds)
    return hash
  }

  async verifyPassword(hash: string): Promise<boolean> {
    if (this.isValid === false) {
      return false;
    }

    const isMatch = bcrypt.compare(this.password as string, hash)
    return isMatch
  }
}
