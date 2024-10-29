// src/database/MongoDatabase.ts
import { Collection, MongoClient, ObjectId, MongoServerSelectionError } from 'mongodb'

import dotenv from 'dotenv'
import { IDatabaseLog } from '../../models/Database/IDatabaseLog'
import { UUID } from 'crypto'
import { exit } from 'process'
import { isNulledFields } from '../Utils'
import { FilterAbstractModel } from '../../models/FilterModel'
// import { MongooseError } from "mongoose";
// eslint-disable @typescript-eslint/space-before-function-paren
dotenv.config()

const { URI_MONGODB, DB_MONGODB, COLLECT_NAME_MONGODB } = process.env

if (isNulledFields([URI_MONGODB, DB_MONGODB, COLLECT_NAME_MONGODB])) {
  console.error('[dblog] - Faltan datos para conectar a la base de datos de registros')
  exit(-255)
}


class MongoDatabase implements IDatabaseLog {
  private readonly client: MongoClient
  private readonly logsCollection: Collection
  private clientisConnected: boolean = false


  getConnectionState = (): boolean => {
    return this.clientisConnected
  };

  constructor() {
    this.client = new MongoClient(URI_MONGODB!);

    this.logsCollection = this.client
      .db(DB_MONGODB)
      .collection(COLLECT_NAME_MONGODB!)

    this.connect().catch((error) => {
      console.error('[dblog] - Error al conectar a la base de datos de registros:', error)
      exit(-255)
    })
  }


  private async connect() {
    try {
      await this.client.connect()
      console.log('[dblog] - Conexión exitosa a la base de datos de registros MongoDB')
      this.clientisConnected = true
    } catch (error) {
      if (error instanceof MongoServerSelectionError) {
        console.error(`[dblog] - Error al conectar a la base de datos de registros MongoDB: ${error.cause?.message}`)
      } else {
        console.error('[dblog] - Error al conectar a la base de datos de registros MongoDB [error Generico]', error)
      }
      exit(-255)
    }
  }

  public async get(query: string, params: any[]): Promise<any> {
    return await this.logsCollection.findOne({ _id: new ObjectId(params[0]) })
  }

  public async all(query: string, params: any[]): Promise<any> {
    return await this.logsCollection.find().toArray()
  }
  public async search(filters: FilterAbstractModel): Promise<any> {
    return await this.logsCollection.find(filters.getFilters()).toArray()
  }

  public async run(query: string, params: any[]): Promise<any> {
    return await this.logsCollection.updateOne(
      { _id: new ObjectId(params[0]) },
      { $set: params[1] }
    )
  }

  public async getLogs(action?: string): Promise<any> {
    const query = action ? { action } : {} // Si action está presente, filtra por ese valor
    return await this.logsCollection.find(query).sort({ timestamp: -1 }).toArray()
  }

  public async writeLog(log: {
    user_id: UUID | null
    action: string
    description?: string
  }): Promise<any> {
    const newLog = {
      user_id: log.user_id ? log.user_id.toString() : null,
      action: log.action,
      description: log.description,
      timestamp: new Date()
    }
    return await this.logsCollection.insertOne(newLog)
  }
}

export default MongoDatabase
