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

    expect(response.body.user).toEqual(
      expect.objectContaining({
        username: 'usertest',
      }),
    )
  })

  it('should be can generate metrics of a user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(201)

    const responseAuth = await request(app.server)
      .post('/auth')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(200)

    const { token } = responseAuth.body

    await request(app.server)
      .post('/meals')
      .send({
        name: 'lunch',
        description: 'beaf',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'lunch',
        description: 'porc',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    const responseMetrics1 = await request(app.server)
      .get(`/users/metrics`)
      .set({ authorization: `Bearer ${token}` })
      .expect(200)

    const { bestOffensive: bestOffensive1 } = responseMetrics1.body

    expect(bestOffensive1).toEqual(2)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'fast',
        description: 'hamburguer',
        isDiet: false,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    const responseMetrics2 = await request(app.server)
      .get(`/users/metrics`)
      .set({ authorization: `Bearer ${token}` })
      .expect(200)

    const { bestOffensive: bestOffensive2 } = responseMetrics2.body

    expect(bestOffensive2).toEqual(2)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'juice',
        description: 'sugar free',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)
    await request(app.server)
      .post('/meals')
      .send({
        name: 'juice',
        description: 'sugar free',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)
    await request(app.server)
      .post('/meals')
      .send({
        name: 'juice',
        description: 'sugar free',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    const responseMetrics3 = await request(app.server)
      .get(`/users/metrics`)
      .set({ authorization: `Bearer ${token}` })
      .expect(200)

    const {
      bestOffensive: bestOffensive3,
      meals,
      mealsWithinDiet,
      mealsOffDiet,
    } = responseMetrics3.body

    expect(bestOffensive3).toEqual(3)
    expect(mealsOffDiet).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'fast',
        }),
      ]),
    )
    expect(mealsWithinDiet).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: 'beaf',
        }),
        expect.objectContaining({
          description: 'porc',
        }),
        expect.objectContaining({
          name: 'juice',
        }),
        expect.objectContaining({
          name: 'juice',
        }),
        expect.objectContaining({
          name: 'juice',
        }),
      ]),
    )
    expect(meals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: 'beaf',
        }),
        expect.objectContaining({
          description: 'porc',
        }),
        expect.objectContaining({
          name: 'fast',
        }),
        expect.objectContaining({
          name: 'juice',
        }),
        expect.objectContaining({
          name: 'juice',
        }),
        expect.objectContaining({
          name: 'juice',
        }),
      ]),
    )
  })
})
