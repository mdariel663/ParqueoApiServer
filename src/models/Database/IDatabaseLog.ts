import { UUID } from "crypto";
import IDatabase from "./IDatabase"
type Log = { user_id: UUID | null, action: string, description?: string };

interface IDatabaseLog extends IDatabase{
    getLogs(action?: string): Promise<any>;
    writeLog(log: Log): Promise<any>;
};

export { IDatabaseLog, Log };