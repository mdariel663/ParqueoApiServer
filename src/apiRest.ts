import dotenv from 'dotenv'
import express, { json } from 'express'
import cors from 'cors'
import { checkDatabaseConnections } from './controllers/controllers'

import MiddlewareErrorHandler from './controllers/middleware/MiddlewareErrors'

// routes
import LogRouter from './routes/logs'
import UserRouter from './routes/user'
import ParkingRouter from './routes/parking'
import ReservaRouter from './routes/reserva'
import { exit } from 'process'

dotenv.config()
const { PORT_SERVER } = process.env

const app = express()
const port = PORT_SERVER ?? 8000

app.use(json())
app.use(cors())
app.use(MiddlewareErrorHandler)

// deshabilitar el header x-powered-by
app.disable('x-powered-by')

// agregar rutas
app.use('/api/v2/logs', LogRouter)
app.use('/api/v2/user', UserRouter)
app.use('/api/v2/parking', ParkingRouter)
app.use('/api/v2/reservas', ReservaRouter)

async function startServer(): Promise<void> {
  await checkDatabaseConnections();
  app.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Servidor corriendo en puerto ${port}`);
    }
  });
}
startServer().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  exit(1);
});
export default app;