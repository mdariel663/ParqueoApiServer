# ParqueoApiServerExamen

Implementacion de un backend para el sistema de parqueo de vehiculos.

## Requisitos

- Node.js
- Express
- MySQL
- TypeScript

## Instalación

1. Clonar el repositorio en tu computadora.
2. Abrir una terminal en la carpeta del repositorio.
3. Ejecutar el siguiente comando para instalar las dependencias necesarias:

```bash
npm install
```
## Configuracion
1. Crear un archivo de configuración en el  `.env` con las siguientes variables o copia los datos de prueba de `.env.example`. Si tu base de datos MYSQL no tiene permisos de root, puedes usar el archivo `.env.example` como base y modificarlo para que se ajuste a tus necesidades.
   
2. Ejecutar el siguiente comando para crear la base de datos y la tabla de usuarios:

```bash
npm run setup
```
# Ejecucion
1. Ejecutar el siguiente comando para iniciar el servidor:

```bash
npm start
```

## Documentación

La documentación del API se encuentra disponible en el archivo `docs/API_DOCS.md`.

La gestion de session para postman esta automatizada. Luego de iniciar session el empieza a obtener el token de respuesta para las proximas peticiones


# Posibles errores
   1.  Si se produce un error de permisos, ejecutar el siguiente comando para corregirlo:

   ```bash
   npm run setup --unsafe-perm
   ```
   2. Si el problema persiste y se muestra algo como esto: 
   ```
=============== Datos ingresados ===============
host:  localhost
user:  root
password:  
Error configurando la base de datos: Error: Access denied for user 'root'@'localhost'
    at Object.createConnection (/media/mariod/Almacen600GB/WorkFlow/ParqueoServerApi/node_modules/mysql2/promise.js:253:31)....
   ```
   Aqui tienes 3 opciones
   1. Configurar el .env con tu usuario de base de datos que tendrias que crear. Abres el fichero .env y modifica las variables DBUSER_MYSQL_DEFAULT y DBPASSWORD_MYSQL_DEFAULT
   ```
   DBUSER_MYSQL_DEFAULT=tu_usuario_sql
   DBPASSWORD_MYSQL_DEFAULT=tu_password_sql
   
   ```
   3. Configura el acceso sin contraseña (opcional y no recomendado en producción): Si deseas permitir que root acceda sin contraseña, configura MySQL para que permita esta autenticación. Puedes hacerlo, pero solo en entornos de desarrollo:
   ```bash
   mysql -u root -p
   ```
   4. Ejecutar manualmente el script de base de datos ubicado en `setupDB.sql`
   
   2. Si el problema persiste y se muestra algo como esto: 
   ```
=============== Datos ingresados ===============
host:  localhost
user:  root
password:  
Error configurando la base de datos: Error: Access denied for user 'root'@'localhost'
    at Object.createConnection (/media/mariod/Almacen600GB/WorkFlow/ParqueoServerApi/node_modules/mysql2/promise.js:253:31)....
   ```
   Aqui tienes 3 opciones
   1. Configurar el .env con tu usuario de base de datos que tendrias que crear. Abres el fichero .env y modifica las variables DBUSER_MYSQL_DEFAULT y DBPASSWORD_MYSQL_DEFAULT
   ```
   DBUSER_MYSQL_DEFAULT=tu_usuario_sql
   DBPASSWORD_MYSQL_DEFAULT=tu_password_sql
   
   ```
   3. Configura el acceso sin contraseña (opcional y no recomendado en producción): Si deseas permitir que root acceda sin contraseña, configura MySQL para que permita esta autenticación. 
   ```sql
   sudo mysql -u root // o en windows lo mismo pero sin el sudo
   
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
   FLUSH PRIVILEGES;
   ```
   4. Ejecutar el script de base de datos ubicado en `setupDB.sql`
   ```
   mysql -u nombre_de_usuario -p < archivo.sql
   ```
