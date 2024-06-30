import fastify from 'fastify'
import { knex } from './database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export const app = fastify()

app.get('/users', async () => {
  const user = await knex('users').select('*')

  return user
})
app.get('/users/:userId/meals', async (request, reply) => {
  const getMealsByUserParams = z.object({
    userId: z.string(),
  })
  const { userId } = getMealsByUserParams.parse(request.params)
  const meals = await knex('meals').select('*').where({
    user_id: userId,
  })

  return reply.status(200).send(meals)
})

app.get('/meals', async () => {
  const userId = '2226d960-d195-4722-9019-438d2911fa83'

  const meal = await knex('meals')
    .insert({
      id: randomUUID(),
      name: 'hambúrguer',
      description: 'hambúrguer x-tudo com bacon, ovos, carne, tomate e alface',
      is_diet: false,
      user_id: userId,
    })
    .returning('*')

  return meal
})
