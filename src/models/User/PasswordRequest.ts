import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export default class PasswordRequest {
    public messageError: string = "";
    public isValid: boolean = true;

    constructor(public password: string | undefined) {
        if (!password) {
            this.isValid = false;
            this.messageError = "El campo password es obligatorio";
        } else if (password.length < 8) {
            this.isValid = false;
            this.messageError = "La contraseña debe tener al menos 8 caracteres";
        }
    }

    async encryptPassword(): Promise<string> {
        if (!this.password) {
            throw new Error("No password provided");
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS || '10'); // Se usa un valor por defecto de 10 si no está definido
        const hash = await bcrypt.hash(this.password, saltRounds);
        return hash;
    }
    async verifyPassword(hash: string) {
        if (!this.password) {
            throw new Error("Password no insertada");
        }
        if (!hash) {
            throw new Error("Hash no insertado");
        }
    
        const isMatch = await bcrypt.compare(this.password, hash);
        return isMatch;
    }
    
}
