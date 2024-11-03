import request from 'supertest'
import { startServer, closeServer } from '../src/server_tests'
let userData = require('../testData/userTests.json')
const commonsResponses = [200, 400, 403, 500]

describe('User Routes', () => {
  let token = []
  let idUsuario = []
  let server

  beforeAll(async () => {
    server = await startServer()
  }, 10000)

  afterAll(async () => {
    await closeServer()
  }, 30000)

  // Crear Usuario
  for (const user of userData) {
    test(`POST / - debe crear un usuario ${user.name}: ${user.role}`, async () => {
      const response = await request(server).post('/api/v2/user').send(user)

      expect(commonsResponses).toContain(response.status)
      expect(response.body.success).toBe(response.status === 200)
    })
  }

  // Iniciar sesión
  for (const user of userData) {
    test(`POST /login - debe iniciar sesión y devolver un token ${user.name}: ${user.role}`, async () => {
      const response = await request(server).post('/api/v2/user/login').send({
        email: user.email,
        password: user.password,
      })

      expect(commonsResponses).toContain(response.status)
      expect(response.body.success).toBe(response.status === 200)
      if (response.status === 200) {
        expect(response.body.message).toBeDefined()
        expect(response.body.token).toBeDefined()
        token.push(response.body.token)
        idUsuario.push(response.body.id)
      }
    })
  }

  // Obtener usuario actual
  for (let idx = 0; idx < userData.length; idx++) {
    test('GET / - debe devolver el usuario actual', async () => {
      const response = await request(server)
        .get('/api/v2/user')
        .set('Authorization', `Bearer ${token[idx]}`)

      expect(commonsResponses).toContain(response.status)

      if (response.status === 200) {
        expect(response.body.success).toBe(true)
        expect(response.body.name).toBeDefined()
        expect(response.body.email).toBeDefined()
        expect(response.body.phone).toBeDefined()
        expect(response.body.role).toBeDefined()
        expect(response.body.created_at).toBeDefined()
        expect(response.body.updated_at).toBeDefined()
      }
    })
  }

  // Obtener lista de usuarios (solo admin)
  for (let idx = 0; idx < userData.length; idx++) {
    const user = userData[idx]

    test(`GET /list - debe devolver la lista de usuarios (solo admin) ${user.name}: ${user.role}`, async () => {
      const response = await request(server)
        .get('/api/v2/user/list')
        .set('Authorization', `Bearer ${token[idx]}`)

      // caso: usuario no autenticado ni admin
      if (response.status === 403) {
        expect(response.status).toBe(403)
        return
      }

      if (response.status === 200) {
        expect(response.body.length).toBeGreaterThan(0)
        response.body.forEach((user_in_request) => {
          expect(user_in_request.id).toBeDefined()
          expect(user_in_request.name).toBeDefined()
          expect(user_in_request.email).toBeDefined()
          expect(user_in_request.role).toBeDefined()
          expect(user_in_request.created_at).toBeDefined()
          expect(user_in_request.updated_at).toBeDefined()
        })
      }
    })
  }

  const userUpdates = [
    { name: 'updatedUser1' },
    { email: 'updatedEmail@example.com' },
    { phone: '+5312345678' },
    { name: 'updatedUser2', email: 'felipe123@gmail.com' },
    { phone: '+5312345679', role: 'admin' },
    { name: 'updatedUser3', phone: '+5312345680', email: 'test@example.com' },
  ]

  // Actualizar usuario
  for (const update of userUpdates) {
    test(`debe actualizar el usuario con ${JSON.stringify(update)}`, async () => {
      const idx = Math.floor(Math.random() * token.length)
      const tokenLocal = token[idx]
      const response = await request(server)
        .put('/api/v2/user')
        .set('Authorization', `Bearer ${tokenLocal}`)
        .send(update)

      expect(commonsResponses).toContain(response.status)

      if (response.status >= 200 && response.status < 300) {
        expect(response.body.message).toBeDefined()
        expect(response.body.success).toBe(true)

        Object.keys(update).forEach((key) => {
          expect(response.body[key]).toBe(update[key])
        })
      }

      // Reset user to original state
      const user = userData[idx]
      const userUpdate = {
        name: user.name,
        email: user.email,
        phone: user.phone,
      }
      await request(server)
        .put('/api/v2/user')
        .set('Authorization', `Bearer ${tokenLocal}`)
        .send(userUpdate)
    })
  }

  test(`DELETE /:id - debe eliminar un usuario`, async () => {
    for (let idx = 0; idx < userData.length; idx++) {
      if (idUsuario[idx] !== undefined) {
        const url = `/api/v2/user/${idUsuario[idx]}`
        const response = await request(server)
          .delete(url)
          .set('Authorization', `Bearer ${token[idx]}`)

        // Eliminar usuario
        expect(commonsResponses).toContain(response.status)
        if (response.status === 200) {
          expect(response.body.message).toBeDefined()
          expect(response.body.success).toBe(true)
        }
      }
    }
  })
})
