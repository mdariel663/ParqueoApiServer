# POST http://localhost:8000/api/v2/parking/reservas - Reserva

##### Descripción:

Reserva un espacio de aparcamiento.

##### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador o empleado.

##### Headers:

Authorization: Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxx

#### Respuesta Exitosa:

Código: **200 OK** \| Ejemplo de Respuesta:

````json
{
  "success": boolean(true),
  "message": "Reserva realizada con éxito",
  "detalles": {
    "id": "string",
    "user_id": "string",
    "parking_space_id": "string",
    "vehiculo": {
      "make": "string",
      "model": "string",
      "plate": "string"
    },
    "start_time": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "end_time": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "created_at": "string", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "updated_at": "string" // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
  }
}
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
  "message": "Error al procesar la reserva"
}
```

Código: **500 Internal Server Error** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": boolean(false),
  "message": "No se puede reservar una plaza de aparcamiento que no existe"
}
```

Código: **400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "message": "No hay plazas disponibles en el horario solicitado",
  "success": boolean(false)
}
```
