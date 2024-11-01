# POST http://localhost:8000/api/v2/parking/reservas

##### Descripción:

Reserva un espacio de aparcamiento.

##### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador o empleado.

##### Headers:

Authorization: Bearer {token}

#### Solicitud

```json
{
  "parkingSpaceId": "string", // ID del espacio de aparcamiento (opcional)
  "userId": "string", // ID del usuario (opcional)
  "currentUserId": "string",
  "vehicleDetails": {
    "make": "string",
    "model": "string",
    "plate": "string"
  },
  "startTime": "YYYY-MM-DDTHH:mm:ss",
  "endTime": "YYYY-MM-DDTHH:mm:ss"
}
```

<br>
#### Respuesta Exitosa:

Código: **200 OK** \| Ejemplo de Respuesta:

````json
{
  "success": boolean(true),
  "message": "Reserva realizada con éxito",
  "detalles": {
    "id": "string",
    "user_id": "string", // ID del usuario que realizó la reserva
    "parking_space_id": "string",
    "vehiculo": {
      "make": "string",
      "model": "string",
      "plate": "string"
    },
    "start_time": "YYYY-MM-DDTHH:mm:ss", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "end_time": "YYYY-MM-DDTHH:mm:ss", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "created_at": "YYYY-MM-DDTHH:mm:ss", // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
    "updated_at": "YYYY-MM-DDTHH:mm:ss" // formato ISO 8601: EJ: "2023-10-01T12:00:00Z"
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

Código: **400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": false,
  "message": "Datos del vehículo no válidos"
}
```

Código: **401 Unauthorized** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": false,
  "message": "Usuario no autenticado"
}
```

---

# GET http://localhost:8000/api/v2/parking/reservas

### Description: Obtener Reservas

Reservar Plaza de Aparcamiento
<br>

#### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador o empleado.

#### Headers:

Authorization: Bearer {token}

#### Respuestas Posibles

```json
{
  "success": true,
  "message": "Reservas obtenidas exitosamente",
  "details": [
    {
      "id": "string",
      "user_id": "string",
      "parking_space_id": "string",
      "vehiculo": {
        "make": "string",
        "model": "string",
        "plate": "string"
      },
      "start_time": "YYYY-MM-DDTHH:mm:ss",
      "end_time": "YYYY-MM-DDTHH:mm:ss",
      "created_at": "YYYY-MM-DDTHH:mm:ss",
      "updated_at": "YYYY-MM-DDTHH:mm:ss"
    }...
  ]
}
```

#### Respuestas Generales:

##### Respuesta Fallida:

Código: **401 Unauthorized** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Usuario no autenticado"
}
```

###### Respuesta Fallida:

Código: **500 Internal Server Error** \| Ejemplo de Respuesta:

```json
{
  "success": boolean(false),
  "message": "Error al obtener las reservas"
}
```

---

# DELETE http://localhost:8000/api/v2/parking/reservas

### Description:

Eliminar Reserva

#### Autenticación:

Requiere que el usuario esté autenticado mediante el token en el header de tipo "Bearer" y que tenga el rol administrador o empleado.

#### Headers:

Authorization: Bearer {token}

#### Solicitud

```json
{
  "reservationId": "string" // UID de la reserva
}
```

#### Respuestas Posibles

Código: **200 OK** \| Ejemplo de Respuesta:

```json
{
  "success": true,
  "message": "Reserva eliminada exitosamente"
}
```

Código: **400 Bad Request** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": false,
  "message": "Datos de reserva no proporcionados"
}
```

Código: **404 Not Found** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": false,
  "message": "No se encontró la reserva"
}
```

Código: **500 Internal Server Error** \| Ejemplo de Respuesta: \| Código:

```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---
