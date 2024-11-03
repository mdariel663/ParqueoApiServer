import request from 'supertest'
import { startServer, closeServer } from '../src/server_tests'

const labUserReservasTests = {
  name: 'Devel ServerReservas',
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

export default describe('Reservas API Endpoints', () => {
  let token
  let server
  let reservationId
  const parkingSpaceTest = 'Aparcamiento1' + randomString()

  beforeAll(async () => {
    server = await startServer()

    // Crear usuario
    let response = await request(server)
      .post('/api/v2/user')
      .send(labUserReservasTests)

    // Iniciar sesión
    response = await request(server).post('/api/v2/user/login').send({
      email: labUserReservasTests.email,
      password: labUserReservasTests.password,
    })

    token = response.body.token
    expect(token).toBeDefined()

    // creando parking
    response = await request(server)
      .post(`/api/v2/parking/${parkingSpaceTest}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('success', true)
  }, 10000)

  afterAll(async () => {
    // Eliminar Parqueo
    await request(server)
      .delete(`/api/v2/parking/${parkingSpaceTest}`)
      .set('Authorization', `Bearer ${token}`)

    // Eliminar usuario
    await request(server)
      .delete('/api/v2/user')
      .set('Authorization', `Bearer ${token}`)

    await closeServer()
  }, 30000)

  test('Debería crear una reserva', async () => {
    const response = await request(server)
      .post('/api/v2/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        parkingSpaceId: parkingSpaceTest,
        vehicleDetails: {
          make: 'Ferrari',
          model: 'Corbet',
          plate: '56E-XFZ-YFI',
        },
        startTime: '2024-12-01T10:00:00Z',
        endTime: '2025-01-01T12:00:00Z',
      })
    console.log('xyz1234567890   ', response.body, response.status)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('details')
    reservationId = response.body.details.id
  })

  test('Debería obtener todas las reservas', async () => {
    const response = await request(server)
      .get('/api/v2/reservas')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(Array.isArray(response.body.details)).toBe(true)
  })

  test('Debería actualizar la reserva', async () => {
    const response = await request(server)
      .put(`/api/v2/reservas/${reservationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehiculo: {
          make: 'EstuartNew',
          model: 'Azure',
          plate: '598-987-154',
        },
        startTime: '2025-01-04T11:00:00Z',
        endTime: '2026-12-04T11:00:00Z',
      })

    console.log('Actualizar Reserva:', response.body)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('details')
    expect(typeof response.body.details).toBe('object')
  })

  test('Debería eliminar una reserva', async () => {
    const response = await request(server)
      .delete(`/api/v2/reservas/${reservationId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success', true)
  })
})
