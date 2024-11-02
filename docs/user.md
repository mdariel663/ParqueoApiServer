# REST API

# Usuarios Endpoints

###### Formatos de datos:

- **Nombre del Usuario**: Alfanumérico, longitud mínima de 3 caracteres, longitud máxima de 50 caracteres.
- **Email**: Alfanumérico, longitud mínima de 5 caracteres, longitud máxima de 100 caracteres.
- **Contraseña**: Alfanumérico, longitud mínima de 8 caracteres, longitud máxima de 50 caracteres.
- **Role**: Alfanumérico, longitud mínima de 3 caracteres, longitud máxima de 50 caracteres.
- **Phone**: Formato +5312345678, longitud mínima de 8 caracteres, longitud máxima de 8 caracteres. Sin contar esto con el +53.

#### Respuestas Generales:

##### Respuesta Fallida:

Código: **401 Unauthorized** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
```

Código: **400 Bad Request** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Datos JSON mal estructurados"
}
```

Código: **500 Internal Server Error** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Error al obtener el usuario."
}
```

## GET / - Obtener Usuario Actual

###### Descripción:

Recupera los datos del usuario autenticado.

###### Headers:

Authorization: Bearer <token>

###### Respuesta Exitosa:

Código: 200 OK \| Ejemplo de Respuesta:

```json
{
  "success": true,
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "string",
  "created_at": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
  "updated_at": "string" // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
}
```

###### Respuesta Fallida:

- Las respuestas generales.

Codigo: **401 Unauthorized** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
```

**400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Datos JSON mal estructurados"
}
```

**500 Internal Server Error** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Error al obtener el usuario."
}
```

## GET /list - Obtener Lista de Usuarios

##### Descripción:

Recupera la lista de usuarios.

##### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador.

##### Consideraciones:

- El usuario tiene que ser administrador para acceder a esta ruta. Lo que significa es que el usuario tiene que tener el rol "admin" en la tabla de usuarios.

###### Respuesta Exitosa:

Código: 200 OK \| Ejemplo de Respuesta:

```json
[
  {
    "id": "UUID",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "created_at": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "updated_at": "string" // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
  },
  ...
]
```

## POST / - Crear Usuario

##### Descripción:

Crea un nuevo usuario en el sistema.

##### Autenticación:

(Puesto asi como modo de prueba, pero en produccion se deberia requerir autenticacion del administrador)
No requiere autenticación previa.

##### Solicitud

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "string" // opcional, si se deja sin definir se asignara el rol "cliente"
}
```

###### Respuesta exitosa:

Código: **200 OK** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(true),
  "user": {
    "id": "UUID",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string"
  }
}

```

###### Respuesta Fallida:

- Las respuestas generales de errores.
- Las respuestas por errores de formato de datos.

Codigo: **401 Unauthorized** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
```

**400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Datos JSON mal estructurados"
}
```

**400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "message": "El usuario ya existe",
  "success": false
}
```

**500 Internal Server Error** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Error al crear el usuario."
}
```

## PUT / - Actualizar Usuario

##### Descripción:

Actualiza los datos del usuario autenticado.

##### Headers:

Authorization: Bearer <token>

#### Consideraciones:

- El usuario tiene que ser administrador para acceder a esta ruta o el usuario tiene que ser el mismo que el actual.

##### Parametros:

- **userId** (opcional y solo puede ser actualizado por el usuario administrador): Id del usuario.
- **name** (opcional): Nombre del usuario.
- **email** (opcional): Email del usuario.
- **phone** (opcional): Numero de telefono del usuario.
- **password** (opcional): Contraseña del usuario.
- **role** (opcional, solo puede ser actualizado por el usuario administrador): Rol del usuario.

##### Solicitud

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "string" // opcional, solo puede ser actualizado por el usuario administrador
}
```

###### Respuesta exitosa:

Código: **200 OK** \| Ejemplo de Respuesta:

```json
{
  "message": "Usuario actualizado con éxito",
  "success": true,
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "string",
  "created_at": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
  "updated_at": "string" // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
}
```

###### Respuesta Fallida:

- Las respuestas generales de errores.
- Las respuestas por errores de formato de datos.

Codigo: **401 Unauthorized** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
```

**400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Datos JSON mal estructurados"
}
```

**400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "message": "El usuario ya existe",
  "success": false
}
```

**500 Internal Server Error** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Error al obtener el usuario."
}
```

## DELETE / - Eliminar Usuario

##### Descripción:

Elimina el usuario autenticado.

##### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador.

##### Consideraciones:

Si no se especifica el parametro userId, se eliminará el usuario autenticado.

##### Parametros

userId (opcional, solo puede ser eliminado por el usuario administrador): Id del usuario.

##### Solicitud:

```json
{
  "userId": "UUID"
}
```

##### Respuesta Exitosa:

Código: **200 OK** \| Ejemplo de Respuesta:

```json
{
  "success": true,
  "message": "Usuario eliminado"
}
```

###### Respuesta Fallida:

- Las respuestas generales de errores.

Codigo: **401 Unauthorized** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
```

**400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Datos JSON mal estructurados"
}
```

**500 Internal Server Error** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "Error al obtener el usuario."
}
```
