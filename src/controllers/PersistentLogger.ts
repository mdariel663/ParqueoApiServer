import { IDatabaseLog, Log } from "../models/Database/IDatabaseLog";

export default class PermanentLogger {
  constructor(private readonly database: IDatabaseLog) {}
  
  getLogs = (action?: string) => {
    return this.database.getLogs(action);
  }
  
  logActivity = (
    userId: `${string}-${string}-${string}-${string}-${string}`,
    action: string,
    description?: string
  ) => {
    this.writeLog({
      user_id: userId,
      action: action,
      description: description,
    });
  };
  writeLog(log: Log) {
    return this.database.writeLog(log);
  }
}
