import request from 'supertest'
import { startServer, closeServer } from '../src/server_tests'

const requestUserTests = {
  name: 'Devel ServerParking',
  email: 'david.1ogs@example.com',
  phone: '+5323396913',
  password: '12Bx21@Afb',
  role: 'admin',
}

const randomString = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

const parkingSpaceOriginal = 'Aparcamiento1' + randomString()
const parkingSpaceUpdated = 'Aparcamiento2' + randomString()

export default describe('Parking API Endpoints', () => {
  let token
  let server

  beforeAll(async () => {
    server = await startServer()

    // Crear usuario
    let response = await request(server)
      .post('/api/v2/user')
      .send(requestUserTests)

    // Iniciar sesión
    response = await request(server).post('/api/v2/user/login').send({
      email: requestUserTests.email,
      password: requestUserTests.password,
    })

    token = response.body.token
    expect(token).toBeDefined()
  }, 10000)

  afterAll(async () => {
    // Eliminar usuario
    await request(server)
      .delete('/api/v2/user')
      .set('Authorization', `Bearer ${token}`)

    await closeServer()
  }, 30000)
  // Test para crear una plaza
  test(`POST /api/v2/parking/${parkingSpaceOriginal} - Creando una plaza de parqueo`, async () => {
    const response = await request(server)
      .post(`/api/v2/parking/${parkingSpaceOriginal}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty(
      'message',
      'Plaza de aparcamiento creada exitosamente',
    )
  })
  // Test para actualizar una plaza
  test(`PUT /api/v2/parking/${parkingSpaceOriginal} - Actualizando una plaza de parqueo`, async () => {
    const response = await request(server)
      .put(`/api/v2/parking/${parkingSpaceOriginal}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        new_parking_space_id: parkingSpaceUpdated,
        is_available: true,
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty(
      'message',
      'Plaza de aparcamiento modificada exitosamente',
    )
  })

  // Test para obtener todas las plazas de aparcamiento
  test('GET /api/v2/parking - devuelve todas las plazas de aparcamiento', async () => {
    const response = await request(server)
      .get('/api/v2/parking')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('parkingSpaces')
  })

  // Test para obtener una plaza por ID
  test(`GET /api/v2/parking/${parkingSpaceUpdated} - Deberia devolver una plaza de parqueo`, async () => {
    const response = await request(server)
      .get(`/api/v2/parking/${parkingSpaceUpdated}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('details')
  })

  // Test para eliminar una plaza
  test(`DELETE /api/v2/parking/${parkingSpaceUpdated} - Elimina una plaza de parqueo`, async () => {
    const response = await request(server)
      .delete(`/api/v2/parking/${parkingSpaceUpdated}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty(
      'message',
      'Plaza de aparcamiento eliminada exitosamente',
    )
  })
})
