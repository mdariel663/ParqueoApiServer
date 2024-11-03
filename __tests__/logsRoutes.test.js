import request from 'supertest'
import { startServer, closeServer } from '../src/server_tests'
const requestUserTests = {
  name: 'Devel Logs',
  email: 'david.logs@example.com',
  phone: '+5323496913',
  password: '12Bx21@Afb',
  role: 'admin',
}

describe('Logs Routes', () => {
  let token
  let server
  let userId

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
    userId = response.body.id

    expect(token).toBeDefined()
  }, 10000)

  afterAll(async () => {
    await closeServer()
  }, 30000)

  test('GET /logs', async () => {
    const response = await request(server)
      .get('/api/v2/logs')
      .set('Authorization', `Bearer ${token}`)

    for (const log of response.body) {
      expect(log.timestamp).toBeDefined()
      expect(log.action).toBeDefined()
      expect(log.level).toBeDefined()
      expect(log.message).toBeDefined()
      expect(log.resource).toBeDefined()
      expect(log.userId).toBeDefined()
    }
    expect(response.status).toBe(200)
    // Delete user
    const deleteResponse = await request(server)
      .delete(`/api/v2/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteResponse.status).toBe(200)
  })
})
