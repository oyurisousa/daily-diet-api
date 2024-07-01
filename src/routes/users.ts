import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const user = await knex('users').select('*')

    return user
  })
}
