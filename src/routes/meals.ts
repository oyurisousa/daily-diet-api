import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { knex } from '../database'
import { verifyJWT } from '../middlewares/verify-jwt'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      onRequest: [verifyJWT],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { sub } = request.user

      const meals = await knex('meals').select('*').where({
        user_id: sub,
      })

      return reply.status(200).send({ meals })
    },
  )
  app.post(
    '/',
    { onRequest: [verifyJWT] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { sub } = request.user

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })
      const { name, description, isDiet } = createMealBodySchema.parse(
        request.body,
      )

      const meal = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          description,
          is_diet: isDiet,
          user_id: sub,
        })
        .returning('*')

      return reply.status(201).send(meal)
    },
  )
}
