// src/database/MongoDatabase.ts
import { Collection, MongoClient, ObjectId, MongoServerSelectionError } from "mongodb";

import dotenv from "dotenv";
import { IDatabaseLog } from "../../models/Database/IDatabaseLog";
import { UUID } from "crypto";
import { exit } from "process";
//import { MongooseError } from "mongoose";

dotenv.config();

class MongoDatabase implements IDatabaseLog {
  private client: MongoClient;
  private logsCollection: Collection;

  constructor() {
    this.client = new MongoClient(process.env.URI_MONGODB?.toString() || "");
    this.logsCollection = this.client
      .db(process.env.DB_MONGODB)
      .collection(process.env.COLLECT_NAME_MONGODB?.toString() || "");

    this.connect().catch((error) => {
      console.error("[dblog] - Error al conectar a la base de datos de registros:", error);
      exit(-255); 
    });
  }

  private async connect() {
    try {
      await this.client.connect();
      console.log("[dblog] - Conexión exitosa a la base de datos de registros MongoDB");
    } catch (error) {
      if (error instanceof MongoServerSelectionError) {
        console.error(`[dblog] - Error al conectar a la base de datos de registros MongoDB: ${error.cause?.message}`);
      } else {
        console.error("[dblog] - Error al conectar a la base de datos de registros MongoDB [error Generico]", error);
      }
      exit(-255)
    }
  }

  public async get(query: string, params: any[]): Promise<any> {
    return this.logsCollection.findOne({ _id: new ObjectId(params[0]) });
  }

  public async all(query: string, params: any[]): Promise<any> {
    return this.logsCollection.find().toArray();
  }

  public async run(query: string, params: any[]): Promise<any> {
    return this.logsCollection.updateOne(
      { _id: new ObjectId(params[0]) },
      { $set: params[1] }
    );
  }

  public async getLogs(action?: string): Promise<any> {
    const query = action ? { action } : {}; // Si action está presente, filtra por ese valor
    return this.logsCollection.find(query).sort({ timestamp: -1 }).toArray();
  }

  public async writeLog(log: {
    user_id: UUID | null;
    action: string;
    description?: string;
  }): Promise<any> {
    const newLog = {
      user_id: log.user_id ? log.user_id.toString() : null,
      action: log.action,
      description: log.description,
      timestamp: new Date(),
    };
    return this.logsCollection.insertOne(newLog);
  }
}

export default MongoDatabase;
