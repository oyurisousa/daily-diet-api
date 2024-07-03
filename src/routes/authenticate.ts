import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { compare } from 'bcrypt'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth', async (request, reply) => {
    const getAuthenticateBody = z.object({
      username: z.string(),
      password: z.string(),
    })
    const { username, password } = getAuthenticateBody.parse(request.body)
    try {
      const user = await knex('users')
        .where({
          username,
        })
        .first()

      if (!user) {
        throw new Error('invalid username or password!')
      }

      const passwordMath = await compare(password, user.password_hash)

      if (!passwordMath) {
        throw new Error('invalid username or password!')
      }

      const token = await reply.jwtSign(
        {},
        {
          sign: {
            sub: user.id,
          },
        },
      )
      return reply.send({
        token,
      })
    } catch (error) {
      return reply.status(400).send({
        error,
      })
    }
  })
}
