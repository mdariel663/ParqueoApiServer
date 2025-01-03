/* eslint-disable */
import { Collection, MongoClient, ObjectId, MongoServerSelectionError } from 'mongodb'
import dotenv from 'dotenv'
import { IDatabaseLog, LogEntry } from '../../models/Database/IDatabaseLog'
import { exit } from 'process'
import { isNulledFields } from '../Utils'
import { FilterAbstractModel } from '../../models/FilterModel'
dotenv.config()

const { URI_MONGODB, DB_MONGODB, COLLECT_NAME_MONGODB } = process.env

if (isNulledFields([URI_MONGODB, DB_MONGODB, COLLECT_NAME_MONGODB])) {
  console.error('[dblog] - Faltan datos para conectar a la base de datos de registros')
  exit(1)
}


class MongoDatabase implements IDatabaseLog {
  private readonly client: MongoClient
  private readonly logsCollection: Collection
  private clientisConnected: boolean = false


  getConnectionState = (): boolean => {
    return this.clientisConnected
  };

  constructor() {
    this.client = new MongoClient(URI_MONGODB as string);

    this.logsCollection = this.client
      .db(DB_MONGODB as string)
      .collection(COLLECT_NAME_MONGODB as string)

    this.connect().catch((error: unknown) => {
      console.error('[dblog] - Error al conectar a la base de datos de registros:', error)
      exit(1)
    })
  }

  async closeConnection(): Promise<void> {
    return await this.client?.close()
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect()
      if (process.env.NODE_ENV === 'production') {
        console.log('[dblog] - Conexión exitosa a la base de datos de registros MongoDB')
      }
      this.clientisConnected = true
    } catch (error: unknown) {
      if (error instanceof MongoServerSelectionError) {
        console.error(`[dblog] - Error al conectar a la base de datos de registros MongoDB: ${error.cause?.message}`)
      } else {
        console.error('[dblog] - Error al conectar a la base de datos de registros MongoDB [error Generico]', error)
      }
      exit(-255)
    }
  }


  public async get(_query: string, params: any[]): Promise<any> {
    return await this.logsCollection.findOne({ _id: new ObjectId(params[0]) })
  }


  public async all(_query: string, _params: any[]): Promise<any> {
    return await this.logsCollection.find().toArray()
  }
  public async search(filters: FilterAbstractModel): Promise<any> {
    return await this.logsCollection.find(filters.getFilters()).toArray()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-any
  public async run(_query: string, params: any[]): Promise<any> {
    return await this.logsCollection.updateOne(
      { _id: new ObjectId(params[0]) },
      { $set: params[1] }
    )
  }

  // is for satisfins the interface
  public async runPlusPlus(query: string, params: unknown[]): Promise<any> {
    throw new Error('Method not implemented.')
  }

  public async getLogs(action?: string): Promise<any> {
    const query = action ? { action } : {} // Si action está presente, filtra por ese valor
    return await this.logsCollection.find(query).sort({ timestamp: -1 }).toArray()
  }

  public async writeLog(log: LogEntry): Promise<any> {


    return await this.logsCollection.insertOne({
      timestamp: log.timestamp.toString() ?? new Date().toString(),
      level: log.level?.toString() ?? 'info',
      message: log.message,
      userId: log.userId?.toString() ?? null,
      action: log.action?.toString() ?? null,
      resource: log.resource?.toString() ?? null,
      details: log.details ?? {}
    })
  }
}

export default MongoDatabase
