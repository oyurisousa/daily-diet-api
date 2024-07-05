import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { knex } from '../database'
import { verifyJWT } from '../middlewares/verify-jwt'

export async function mealsRoutes(app: FastifyInstance) {
  // app.get('/', async () => {
  //   const meals = knex('meals').select('*').returning('*')

  //   return meals
  // })
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
}
