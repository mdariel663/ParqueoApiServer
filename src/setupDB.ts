import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config()
// Configuración de la base de datos
const dbConfig = {
  host: process.env.DBHOST_MYSQL_DEFAULT || "",
  user: process.env.DBUSER_MYSQL_DEFAULT || "",
  password: process.env.DBPASSWORD_MYSQL_DEFAULT || "",
};

// Leer y ejecutar el archivo SQL
const setupDatabase = async () => {
  try {
    console.log("=============== Datos ingresados ===============")
    console.log("host: ", process.env.DBHOST_MYSQL_DEFAULT)
    console.log("user: ", process.env.DBUSER_MYSQL_DEFAULT)
    console.log("password: ", process.env.DBPASSWORD_MYSQL_DEFAULT )
    // Crear conexión a la base de datos
    const connection = await mysql.createConnection(dbConfig);
    console.log("Conexión a la base de datos establecida");

    // Leer el archivo setupdb.sql
    const sqlFilePath = path.join(__dirname, 'setupdb.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Dividir el archivo en líneas de comandos SQL
    const sqlStatements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Ejecutar cada línea de comando
    for (const statement of sqlStatements) {
      console.log(`Ejecutando: ${statement}`);
      await connection.query(statement);
    }

    console.log('Base de datos configurada correctamente.');
    await connection.end();
  } catch (error: any) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Error configurando la base de datos: No tienes permisos de root... Modifica tu archivo .env para que se ajuste a tus necesidades.'); 
    } else {
      console.error('Error configurando la base de datos:', error);
    }
  }
};

setupDatabase();
