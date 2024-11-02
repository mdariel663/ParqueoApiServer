### **Obtener Todos los Espacios de Estacionamiento**

**Método:** `GET`
**URL:** `/api/parking`
**Authorization:** Bearer

#### Respuesta Exitosa

```json
{
  "success": true,
  "parkingSpaces": [
    {
      "parking_space_id": "string",
      "is_available": true,
      "reservations_count": 0
    }
  ],
  "message": "Plazas de aparcamiento obtenidas exitosamente"
}
```

#### Respuesta de Error

```json
{
  "success": false,
  "message": "No se pudo obtener las plazas de aparcamiento"
}
```

### Obtener Espacio de Estacionamiento por ID

- **Método:** `GET`

- **URL:** `/api/parking/:spaceId`

- Authorization: Bearer

#### Parámetros

- `spaceId`: ID del espacio de estacionamiento que se desea obtener.

#### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Reserva obtenida exitosamente",
  "details": {
    "parking_space_id": "string",
    "is_available": true,
    "reservations_count": 0
  }
}
```

#### Respuesta de Error

```json
"message": "No se puede obtener la reserva de la plaza"
}

```

###### Crear un Espacio de Estacionamiento

```json
Método: POST
URL: /api/parking/:spaceId
Headers:
Authorization: Bearer <token>

```

Parámetros

```json
spaceId: ID del nuevo espacio de estacionamiento a crear.
```

###### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Plaza de aparcamiento creada exitosamente",
  "details": {
    "parking_space_id": "string"
  }
}
```

###### Respuesta de Error

```json
{
  "success": false,
  "message": "Ya existe un parking con el mismo nombre"
}
```

#### Respuesta Fallida

```json
{
  "success": false,
  "message": "Datos de reserva no proporcionados"
}
```

### Actualizar Espacio de Estacionamiento

- **Método:** `PUT`

- **URL:** `/api/parking/:spaceId`

- Authorization: Bearer

#### Parámetros

- `spaceId`: ID del espacio de estacionamiento que se desea actualizar.

#### Cuerpo de la Solicitud

````json
{
  "new_parking_space_id": "string",
  "is_available": true // opcional
}
#### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Plaza de aparcamiento modificada exitosamente",
  "details": {
    "parking_space_id": "string",
    "is_available": true,
    "reservations_count": 0
  }
}
````

#### Respuesta de Error

````json
{
  "success": false,
  "message": "No se pudo modificar la plaza"
}
```
---

### Eliminar Espacio de Estacionamiento

- **Método:** `DELETE`

- **URL:** `/api/parking/:spaceId`

- Authorization: Bearer

#### Parámetros

- `spaceId`: ID del espacio de estacionamiento que se desea eliminar.

#### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Plaza de aparcamiento eliminada exitosamente"
}
```

#### Respuesta de Error

```json
{
  "success": false,
  "message": "No se pudo eliminar la plaza"
}
```
````
