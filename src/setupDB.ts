import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()
const {DBHOST_MYSQL_DEFAULT, DBUSER_MYSQL_DEFAULT, DBPASSWORD_MYSQL_DEFAULT} = process.env

const dbConfig = {
  host: DBHOST_MYSQL_DEFAULT,
  user: DBUSER_MYSQL_DEFAULT,
  password: DBPASSWORD_MYSQL_DEFAULT
}

const setupDatabase = async () => {
  try {

    console.log('=============== Datos ingresados ===============')
    console.log('Config: ', dbConfig)
    // Crear conexión a la base de datos
    const connection = await mysql.createConnection(dbConfig)
    console.log('Conexión a la base de datos establecida')

    // Leer el archivo setupdb.sql
    const sqlFilePath = path.join(__dirname, 'setupdb.sql')
    const sql = fs.readFileSync(sqlFilePath, 'utf-8')

    // Dividir el archivo en líneas de comandos SQL
    const sqlStatements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    // Ejecutar cada línea de comando
    for (const statement of sqlStatements) {
      console.log(`Ejecutando: ${statement}`)
      await connection.query(statement)
    }

    console.log('Base de datos configurada correctamente.')
    await connection.end()
  } catch (error: any) {   
    const { code, message } = error

    // Mensajes personalizados según el código de error de MySQL
    switch (code) {
      case 'ER_ACCESS_DENIED_ERROR':
        console.error('⚠️ Acceso denegado: Revisa tus credenciales de base de datos en el archivo .env. Puede que necesites permisos de root o verificar el nombre de usuario y contraseña.');
        break
      case 'ER_ACCESS_DENIED_NO_PASSWORD_ERROR':
        console.error('⚠️ Acceso denegado: Parece que la contraseña no se proporcionó. Verifica que el campo DBPASSWORD_MYSQL_DEFAULT en el archivo .env no esté vacío.');
        break
      case 'ENOTFOUND':
        console.error('⚠️ Error de conexión: No se pudo encontrar el host especificado. Revisa que DBHOST_MYSQL_DEFAULT esté correcto en el archivo .env.');
        break
      default:
        console.error(`⚠️ Error configurando la base de datos: ${message}`);
    }
  }
}

setupDatabase()
