import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { string, z } from 'zod'
import { randomUUID } from 'crypto'
import { hash } from 'bcrypt'
import { verifyJWT } from '../middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const createUserBodySchema = z.object({
      username: string().min(3),
      password: string().min(8),
    })

    const { username, password } = createUserBodySchema.parse(request.body)

    const userExists = await knex('users')
      .where({
        username,
      })
      .first()

    if (userExists) {
      return reply.status(400).send({
        message: 'username already exists!',
      })
    }

    const [user] = await knex('users')
      .insert({
        id: randomUUID(),
        username,
        password_hash: await hash(password, 10),
      })
      .returning('*')

    await knex('offensive').insert({
      id: randomUUID(),
      user_id: user.id,
    })

    return reply.status(201).send({ user })
  })

  app.get(
    '/metrics',
    { onRequest: verifyJWT },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { sub } = request.user

      const meals = await knex('meals')
        .select('*')
        .where({
          user_id: sub,
        })
        .returning('*')

      const mealsWithinDiet = await knex('meals')
        .select('*')
        .where({
          user_id: sub,
          is_diet: true,
        })
        .returning('*')

      const mealsOffDiet = await knex('meals')
        .select('*')
        .where({
          user_id: sub,
          is_diet: false,
        })
        .returning('*')

      const offensive = await knex('offensive')
        .where({
          user_id: sub,
        })
        .select('best_offensive')
        .first()

      return reply.send({
        meals,
        mealsWithinDiet,
        mealsOffDiet,
        bestOffensive: offensive?.best_offensive,
      })
    },
  )
}
