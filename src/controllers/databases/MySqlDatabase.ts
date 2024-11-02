/* eslint-disable */

import mysql from 'mysql2/promise'
import IDatabase from '../../models/Database/IDatabase'
import { isNulledFields } from '../Utils'
import dotenv from 'dotenv'
import { exit } from 'process'

dotenv.config()
const { DB_HOST_MYSQL, DB_USER_MYSQL, DB_PASSWORD_MYSQL, DB_NAME_MYSQL, DB_PORT_MYSQL } = process.env

if (isNulledFields([DB_HOST_MYSQL, DB_USER_MYSQL, DB_PASSWORD_MYSQL, DB_NAME_MYSQL, DB_PORT_MYSQL])) {
  console.error('[db] - Faltan datos para conectar a la base de datos')
  exit(-255)
}


class MySQLDatabase implements IDatabase {
  private db: mysql.Connection | null = null
  private clientisConnected = false;

  constructor() {

    if (process.env.NODE_ENV === 'development') {
      console.log('[db] - Conectando a la base de datos MySQL...')
    }
    this.connect().catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[db] - Error al conectar a la base de datos:', error)
      }
      exit(1)
    })
  }


  getConnectionState(): boolean {
    return this.clientisConnected;
  }


  private async connect(): Promise<boolean> {
    try {
      // db ya esta inicializada
      if (this.db != null) return true

      this.db = await mysql.createConnection({
        host: DB_HOST_MYSQL,
        user: DB_USER_MYSQL,
        password: DB_PASSWORD_MYSQL,
        database: DB_NAME_MYSQL,
        port: process.env.DB_PORT_MYSQL ? Number(process.env.DB_PORT) : 3306
      })
      this.clientisConnected = true;
      return true
    } catch (error) {
      console.error('[db] - Error de conexión:', error)
      exit(1);
    }
  }

  // Validación antes de usar la conexión para evitar problemas si no está definida
  private async ensureConnection() {
    if (this.db == null) {
      await this.connect()
    }
  }

  public async get(query: string, params: any[]): Promise<any> {
    await this.ensureConnection();
    try {
      const [rows]: any = await this.db!.execute(query, params);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }


  public async all(query: string, params: unknown[]): Promise<any> {
    await this.ensureConnection()
    try {
      const [rows] = await this.db!.execute(query, params)
      return rows
    } catch (error) {
      throw error
    }
  }

  public async runPlusPlus(query: string, params: unknown[]): Promise<any> {
    await this.ensureConnection()
    try {
      if (this.db == null) {
        await this.connect()
      } else {
        const [result] = await this.db.execute(query, params)
        return result
      }
    } catch (error) {
      throw error
    }
    return null
  }
  public async run(query: string, params: unknown[]): Promise<any> {
    await this.ensureConnection()
    try {
      if (this.db == null) {
        await this.connect()
      } else {
        const [result] = await this.db.execute(query, params)
        return result
      }
    } catch (error) {
      throw error
    }
  }
}

export default MySQLDatabase
