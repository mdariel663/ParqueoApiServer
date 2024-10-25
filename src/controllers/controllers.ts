import Middleware from './middleware/Middleware';
import TokenService from '../services/TokenService'
import MySqlDatabase from './databases/MySqlDatabase'
import MongoDatabase from './databases/MongoDatabase';
import PersistentLogger from './PersistentLogger';
import dotenv from "dotenv"

dotenv.config()

// Crear instancias
const databaseRepository = new MySqlDatabase(); 

const tokenService = new TokenService();
const persistentLog = new PersistentLogger(new MongoDatabase())
const middleware = new Middleware(tokenService, databaseRepository);

// Middlewares
export const onlyAuthenticatedAccess = middleware.onlyAutenticated;
export const onlyAdminAccess = middleware.authorizeAdmin;
// Exportar servicios
export default {  middleware, persistentLog, tokenService, databaseRepository };
