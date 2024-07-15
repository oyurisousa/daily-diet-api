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

describe('Meals routes', () => {
  it('should be can register a meal', async () => {
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

    const responseMeal = await request(app.server)
      .post('/meals')
      .send({
        name: 'natural juice',
        description: 'sugar free orange juice',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    expect(responseMeal.body.meal).toEqual([
      expect.objectContaining({
        name: 'natural juice',
        description: 'sugar free orange juice',
        is_diet: 1,
      }),
    ])
  })

  it('should be get info a meal', async () => {
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

    const responseCreateMeal = await request(app.server)
      .post('/meals')
      .send({
        name: 'natural juice',
        description: 'sugar free orange juice',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)
    const [meal] = responseCreateMeal.body.meal

    const responseMeal = await request(app.server)
      .get(`/meals/${meal.id}`)
      .set({ authorization: `Bearer ${token}` })
      .expect(200)

    expect(responseMeal.body.meal).toEqual(
      expect.objectContaining({
        name: 'natural juice',
        description: 'sugar free orange juice',
        is_diet: 1,
      }),
    )
  })

  it('should be can update a meal', async () => {
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

    const responseCreateMeal = await request(app.server)
      .post('/meals')
      .send({
        name: 'natural juice',
        description: 'sugar free orange juice',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    const { meal } = await responseCreateMeal.body

    const responseUpdateMeal = await request(app.server)
      .put(`/meals/${meal[0].id}`)
      .send({
        description: 'sugar free acerola juice',
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(200)

    expect(responseUpdateMeal.body.mealUpdated).toEqual([
      expect.objectContaining({
        name: 'natural juice',
        description: 'sugar free acerola juice',
      }),
    ])
  })

  it('should be can delete a meal', async () => {
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

    const responseCreateMeal = await request(app.server)
      .post('/meals')
      .send({
        name: 'natural juice',
        description: 'sugar free orange juice',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    const { meal } = await responseCreateMeal.body

    await request(app.server)
      .delete(`/meals/${meal[0].id}`)
      .set({ authorization: `Bearer ${token}` })
      .expect(204)

    await request(app.server)
      .get(`/meals/${meal[0].id}`)
      .set({ authorization: `Bearer ${token}` })
      .expect(400)
  })

  it.only('should not be can delete a meal created by other user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(201)

    await request(app.server)
      .post('/users')
      .send({
        username: 'usertest2',
        password: '12345678',
      })
      .expect(201)

    const responseAuthUser1 = await request(app.server)
      .post('/auth')
      .send({
        username: 'usertest',
        password: '12345678',
      })
      .expect(200)

    const { token } = responseAuthUser1.body

    const responseAuthUser2 = await request(app.server)
      .post('/auth')
      .send({
        username: 'usertest2',
        password: '12345678',
      })
      .expect(200)

    const { token: token2 } = responseAuthUser2.body

    const responseUser1CreateMeal = await request(app.server)
      .post('/meals')
      .send({
        name: 'natural juice',
        description: 'sugar free orange juice',
        isDiet: true,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)

    const { meal } = await responseUser1CreateMeal.body

    await request(app.server)
      .delete(`/meals/${meal[0].id}`)
      .set({ authorization: `Bearer ${token2}` })
      .expect(400)

    await request(app.server)
      .get(`/meals/${meal[0].id}`)
      .set({ authorization: `Bearer ${token}` })
      .expect(200)
  })
})
