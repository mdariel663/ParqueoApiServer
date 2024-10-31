import { IDatabaseLog, Log } from '../models/Database/IDatabaseLog'
export default class PermanentLogger {

  constructor(private readonly database: IDatabaseLog) { }

  getLogs = async (action?: string): Promise<unknown> => {
    return await this.database.getLogs(action)
  }

  logActivity = async (
    userId: `${string}-${string}-${string}-${string}-${string}`,
    action: string,
    description?: string
  ): Promise<void> => {
    await this.writeLog({
      user_id: userId,
      action,
      description
    }).catch((error: unknown) => {
      console.log('Error al registrar el log', error);
    })

  }

  async writeLog(log: Log): Promise<unknown> {
    return await this.database.writeLog(log)
  }
}
