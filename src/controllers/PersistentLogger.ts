import { IDatabaseLog, LogEntry } from '../models/Database/IDatabaseLog'
export default class PermanentLogger {

  constructor(private readonly database: IDatabaseLog) { }

  async getLogs(action?: string): Promise<unknown> {
    return await this.database.getLogs(action)
  }

  async writeLog(log: LogEntry): Promise<unknown> {
    return await this.database.writeLog(log)
  }
}
