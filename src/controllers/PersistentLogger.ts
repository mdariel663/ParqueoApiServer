import { IDatabaseLog, Log } from '../models/Database/IDatabaseLog'

export default class PermanentLogger {
  constructor (private readonly database: IDatabaseLog) {}

  getLogs = async (action?: string) => {
    return await this.database.getLogs(action)
  }

  logActivity = (
    userId: `${string}-${string}-${string}-${string}-${string}`,
    action: string,
    description?: string
  ) => {
    this.writeLog({
      user_id: userId,
      action,
      description
    })
  }

  async writeLog (log: Log) {
    return await this.database.writeLog(log)
  }
}
