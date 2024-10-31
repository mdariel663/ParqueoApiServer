import { UUID } from 'crypto'
import IDatabase from './IDatabase'
interface Log { user_id: UUID | null, action: string, description?: string }
// @ts-ignore
interface IDatabaseLog extends IDatabase {
  getLogs: (action?: string) => Promise<unknown>
  writeLog: (log: Log) => Promise<unknown>
}

export { IDatabaseLog, Log }
