import Middleware from './middleware/Middleware';
import TokenService from '../services/TokenService';
import MySqlDatabase from './databases/MySqlDatabase';
import MongoDatabase from './databases/MongoDatabase';
import PersistentLogger from './PersistentLogger';
import dotenv from 'dotenv';
import IDatabase from '../models/Database/IDatabase';
import { IDatabaseLog } from '../models/Database/IDatabaseLog';
import ITokenModel from '../models/ITokenModel';
import IMiddleware from '../models/IMiddleware';

dotenv.config();

// Crear instancias
export const databaseRepository: IDatabase = new MySqlDatabase();
export const databaseRepositoryMongo: IDatabaseLog = new MongoDatabase();

//console.log("[db] - Esperando conexión con base de datos...");
//console.log("[db] - Esperando conexión con base de datos de registros...");

const waiterMs = 3000; // en ms
const counterMax = 10;
let counter = 0;

export const checkDatabaseConnections = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            const mongoConnected = databaseRepositoryMongo.getConnectionState();
            const dbConnected = databaseRepository.getConnectionState();

            // Ambas bases de datos están conectadas
            if (mongoConnected && dbConnected) {
                clearInterval(intervalId);
                resolve(true);
            } else {
                counter++;
                if (counter >= counterMax) {
                    const connectedDB: boolean = databaseRepository.getConnectionState();
                    const connectedMongo: boolean = databaseRepositoryMongo.getConnectionState();
                    const preCalc: number = counter * waiterMs;

                    console.warn(`[db] - No se pudo conectar a la base de datos por más de ${preCalc} ms`);
                    console.warn(`[db] - Estado de conexión con MySQL: ${connectedDB}`);
                    console.warn(`[db] - Estado de conexión con MongoDB: ${connectedMongo}`);
                    console.warn("==================================================================");
                    clearInterval(intervalId);
                    reject(new Error("No se pudo conectar a las bases de datos."));
                }
            }
        }, waiterMs);
    });
};

export const tokenService: ITokenModel = new TokenService();
export const persistentLog: PersistentLogger = new PersistentLogger(databaseRepositoryMongo);
export const middleware: IMiddleware = new Middleware(tokenService, databaseRepository);

export const onlyAuthenticatedAccess = middleware.onlyAuthenticated;
export const onlyAdminAccess = middleware.authorizeAdmin;
export const onlyStaffAccess = middleware.authorizeStaff;
if (process.env.NODE_ENV === 'production') {
    console.log("[server] - Iniciando Servidor Completamente....");
}
