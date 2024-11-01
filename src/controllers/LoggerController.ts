import { LogEntry } from "../models/Database/IDatabaseLog"
import controllers from "./controllers"
export const defaultEntryLog: LogEntry = {
    timestamp: new Date(),
    level: 'info',
    message: '',
    action: '',
    resource: '',
    details: { action: '', description: '' }
}

class LoggerController {
    static sendReserva(userId: string, dataReserva: { parking_space_id: string; vehicleData: string | { make: string; model: string; plate: string } }, isSuccess: boolean): void {
        let newEntry: LogEntry = { ...defaultEntryLog }
        if (isSuccess) {
            newEntry.message = `Usuario reservó una plaza`
            newEntry.action = 'Reserva Exitosa'
            newEntry.details = { action: 'Reserva Exitosa', description: "Usuario reservó una plaza", userId, dataReserva }
        } else {
            newEntry.action = 'Reserva Fallida'
            newEntry.details = { action: 'Reserva Fallida', description: "Usuario no reservó una plaza", userId, dataReserva }
        }
        newEntry.resource = 'reserva'

        this.sendLog(newEntry)
    }
    static sendLogin(phone_or_email_or_userId: string, isSuccess: boolean): void {
        let newEntry: LogEntry = { ...defaultEntryLog }
        if (isSuccess) {
            newEntry.message = `Intento de autenticar usuario con email o phone: ${phone_or_email_or_userId}`
            newEntry.action = 'Login Exitoso'
            newEntry.details = { action: 'Login Exitoso', description: "Usuario autenticado" }
        } else {
            newEntry.action = 'Login Fallido'
            newEntry.details = { action: 'Login Fallido', description: "Usuario no autenticado" }
        }
        newEntry.resource = 'user'

        this.sendLog(newEntry)
    }


    static sendLog(newEntry: LogEntry): void {
        controllers.persistentLog.writeLog(newEntry).catch((error: unknown) => {
            console.log('Error al registrar el log', error);
        })
    }
}

export default LoggerController