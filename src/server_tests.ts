// server.js
import { app } from './serverConfig'
import http from 'http'
import { checkDatabaseConnections, databaseRepository, databaseRepositoryMongo } from './controllers/controllers'

let server: http.Server | undefined
let port = process.env.PORT ?? 3000
export const closeDatabaseConnections = async () => {
  if (databaseRepository == null || databaseRepositoryMongo == null) {
    console.error('No se puede cerrar la conexión a la base de datos, ya no se ha inicializado')
    return
  }

  await databaseRepository.closeConnection();
  await databaseRepositoryMongo.closeConnection();
}
export const startServer = async () => {
  if (!server) {
    console.log('Iniciando el servidor...')
    await checkDatabaseConnections()
    server = app.listen(port, () => {
      console.log(`Servidor de pruebas corriendo en puerto ${port}`)
    })
  }
  return server
}

export const closeServer = async () => {
  if (server) {
    await new Promise((resolve) => server?.close(resolve)).catch((error) => {
      console.error('Error al cerrar el servidor:', error)
    })
    await closeDatabaseConnections();

    server = undefined
  }
}
