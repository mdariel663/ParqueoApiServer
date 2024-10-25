import mysql from "mysql2/promise";
import IDatabase from "../../models/Database/IDatabase";
import dotenv from "dotenv";
import { exit } from "process";
dotenv.config();

class MySQLDatabase implements IDatabase {
  private db: mysql.Connection | null = null;

  constructor() {
    this.connect().catch((error) => {
      console.error("[db] - Error al conectar a la base de datos:", error);
      exit(-255); 
    });
  }

  private async connect() {
    try {
      // db ya esta inicializada
      if (this.db) return;

      this.db = await mysql.createConnection({
        host: process.env.DB_HOST_MYSQL,
        user: process.env.DB_USER_MYSQL,
        password: process.env.DB_PASSWORD_MYSQL,
        database: process.env.DB_NAME_MYSQL,
        port: process.env.DB_PORT_MYSQL ? Number(process.env.DB_PORT) : 3306,
      });
      console.log("[db] - Conexión exitosa a la base de datos MySQL");
    } catch (error) {
      console.error("[db] - Error de conexión:", error);
      throw error;
    }
  }

  // Validación antes de usar la conexión para evitar problemas si no está definida
  private async ensureConnection() {
    if (!this.db) {
      await this.connect();
    }
  }

// Obtiene el primer elemento
  public async get(query: string, params: any[]): Promise<any> {
    await this.ensureConnection();
    try {
      const rows = await this.db!.execute(query, params);
      return rows[0] || null; 
    } catch (error) {
      throw error;
    }
  }

  // Obtiene todos las filas
  public async all(query: string, params: any[]): Promise<any> {
    await this.ensureConnection();
    try {
      const [rows] = await this.db!.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  public async run(query: string, params: any[]): Promise<any> {
    await this.ensureConnection();
    try {
      const [result] = await this.db!.execute(query, params);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default MySQLDatabase;
