import { UUID } from 'crypto'
import IDatabase from './IDatabase'
interface LogEntry {
  timestamp: Date; // Fecha y hora del evento
  level: 'info' | 'warn' | 'error' | 'critical'; // Nivel de severidad del log
  message: string; // Mensaje descriptivo del evento
  userId?: UUID; // ID del usuario involucrado, si aplica
  action?: string; // Acción realizada, por ejemplo, 'reserve', 'update', 'login', etc.
  resource?: string; // Recurso afectado, por ejemplo, 'parking_slot', 'user', etc.
  details?: object; // details adicionales (opcional), como el payload de la solicitud o el error
  ipAddress?: string; // Dirección IP del cliente que realiza la solicitud
}

interface IDatabaseLog extends IDatabase {
  getLogs: (action?: string) => Promise<unknown>
  writeLog: (log: LogEntry) => Promise<unknown>
}

export { IDatabaseLog, LogEntry }
