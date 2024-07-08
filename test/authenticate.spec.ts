import { afterAll, beforeAll, it, beforeEach, describe, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  execSync('npm run knex migrate:rollback --all')
  execSync('npm run knex migrate:latest')
})

describe('Authenticate routes', () => {
  it('should be can authenticate a user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(201)

    const response = await request(app.server)
      .post('/auth')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(200)
    expect(response.body.token).toEqual(expect.any(String))
  })

  it('should be not can authenticate a user when dont match passwords ', async () => {
    await request(app.server)
      .post('/users')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(201)

    const response = await request(app.server)
      .post('/auth')
      .send({
        username: 'usertest',
        password: '1234567',
      })
      .expect(400)
    expect(response.error).instanceOf(Error)
  })
})
