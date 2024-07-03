import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { verifyJWT } from '../middlewares/verify-jwt'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meals = knex('meals').select('*').returning('*')

    return meals
  })
  app.get(
    '/:userId',
    {
      onRequest: [verifyJWT],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const getMealsByUserParams = z.object({
        userId: z.string(),
      })
      const { userId } = getMealsByUserParams.parse(request.params)
      const meals = await knex('meals').select('*').where({
        user_id: userId,
      })

      return reply.status(200).send(meals)
    },
  )
}
