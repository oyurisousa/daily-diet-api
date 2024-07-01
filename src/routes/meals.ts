import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meals = knex('meals').select('*').returning('*')

    return meals
  })
  app.get('/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const getMealsByUserParams = z.object({
      userId: z.string(),
    })
    const { userId } = getMealsByUserParams.parse(request.params)
    const meals = await knex('meals').select('*').where({
      user_id: userId,
    })

    return reply.status(200).send(meals)
  })
}
