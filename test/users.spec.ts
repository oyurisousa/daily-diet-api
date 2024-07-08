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

describe('Users routes', () => {
  it('should be can register a user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(201)

    expect(response.body.user).toEqual([
      expect.objectContaining({
        username: 'usertest',
      }),
    ])
  })
})
