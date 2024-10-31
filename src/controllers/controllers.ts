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
const databaseRepository: IDatabase = new MySqlDatabase();
const databaseRepositoryMongo: IDatabaseLog = new MongoDatabase();

console.log("[db] - Esperando conexión con base de datos...");
console.log("[db] - Esperando conexión con base de datos de registros...");

const waiterMs = 5000; // en ms
const counterMax = 5;
let counter = 0;

const checkDatabaseConnections = (): boolean => {
    const mongoConnected = databaseRepositoryMongo.getConnectionState();
    const dbConnected = databaseRepository.getConnectionState();

    // Ambas bases de datos están conectadas
    if (mongoConnected && dbConnected) {
        console.log("[db] - Conexión con ambas bases de datos establecida");
        return true;
    }

    counter++;
    if (counter >= counterMax) {
        const connectedDB: boolean = databaseRepository.getConnectionState();
        const connectedMongo: boolean = databaseRepositoryMongo.getConnectionState();
        const preCalc: number = counter * waiterMs;

        console.warn(`[db] - No se pudo conectar a la base de datos por más de ${preCalc} ms`);
        console.warn(`[db] - Estado de conexión con MySQL: ${connectedDB}`);
        console.warn(`[db] - Estado de conexión con MongoDB: ${connectedMongo}`);
        console.warn("==================================================================");
    }
    // No están conectadas
    return false;
};

const intervalId = setInterval(() => {
    if (checkDatabaseConnections()) {
        clearInterval(intervalId);
    }
}, waiterMs);

const tokenService: ITokenModel = new TokenService();
const persistentLog: PersistentLogger = new PersistentLogger(databaseRepositoryMongo);
const middleware: IMiddleware = new Middleware(tokenService, databaseRepository);

export const onlyAuthenticatedAccess = middleware.onlyAuthenticated;
export const onlyAdminAccess = middleware.authorizeAdmin;
console.log("[server] - Iniciando Servidor Completamente....");

export default { middleware, persistentLog, tokenService, databaseRepository };
