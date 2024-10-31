import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

import MiddlewareErrorHandler from './controllers/middleware/MiddlewareErrors'

// routes
import LogRouter from './routes/logs'
import UserRouter from './routes/user'
import ParkingRouter from './routes/parking'
dotenv.config()
const { PORT_SERVER } = process.env

const app = express()
const port = PORT_SERVER ?? 8000

app.use(express.json())
app.use(cors())
app.use(MiddlewareErrorHandler)
// agregar rutas
app.use('/api/v2/logs', LogRouter)
app.use('/api/v2/user', UserRouter)
app.use('/api/v2/parking', ParkingRouter)

try {
  app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
  })
} catch (error) {
  console.error('Error inicializando el servidor:', error)
}
