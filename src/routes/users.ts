import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { string, z } from 'zod'
import { randomUUID } from 'crypto'
import { hash } from 'bcrypt'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await knex('users').select('*')

    return reply.send(user)
  })

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const createUserBodySchema = z.object({
      username: string().min(3),
      password: string().min(8),
    })

    const { username, password } = createUserBodySchema.parse(request.body)
    const user = await knex('users').insert({
      id: randomUUID(),
      username,
      password_hash: await hash(password, 10),
    })

    return reply.status(201).send(user)
  })
}
