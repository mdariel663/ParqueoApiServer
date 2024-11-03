import { app } from './serverConfig'
import http from 'http'
import { checkDatabaseConnections, databaseRepository, databaseRepositoryMongo } from './controllers/controllers'

let server: http.Server | undefined
let port = process.env.PORT ?? 3000
export const closeDatabaseConnections = async (): Promise<void> => {
  if (databaseRepository == null || databaseRepositoryMongo == null) {
    console.error('No se puede cerrar la conexión a la base de datos, ya no se ha inicializado')
    return
  }

  await databaseRepository.closeConnection();
  await databaseRepositoryMongo.closeConnection();
}
export const startServer = async (): Promise<http.Server> => {
  if (server === undefined) {
    // para no contaminar el output de los tests
    // console.log('Iniciando el servidor...')
    await checkDatabaseConnections()
    server = app.listen(port)
  }
  return server
}

export const closeServer = async (): Promise<void> => {
  if (server) {
    await new Promise((resolve) => server?.close(resolve)).catch((error) => {
      console.error('Error al cerrar el servidor:', error)
    })
    await closeDatabaseConnections();

    server = undefined
  }
}
