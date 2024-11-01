# GET http://localhost:8000/api/v2/logs - Logs

##### Descripción:

Obtiene los logs del servidor.

##### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador o empleado.

##### Headers:

Authorization: Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxx

#### Respuesta Exitosa:

Código: **200 OK** \| Ejemplo de Respuesta:

````json
[
  {
    "timestamp": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "level": "string", /// Nivel de log: info, warn, error, critical
    "message": "string",
    "userId": "string",
    "action": "string", // Acción realizada, por ejemplo, 'reserve', 'update', 'login', etc.
    "resource": "string", // Recurso afectado, por ejemplo, 'parking_slot', 'user', etc.
    "details": object // Detalles adicionales (opcional), descripcion
    }
  },
  ...
]
#### Respuestas Generales:

##### Respuesta Fallida:

Código: **401 Unauthorized** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
````

###### Respuesta Fallida:

Código: **500 Internal Server Error** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Error al obtener los registros"
}
```
