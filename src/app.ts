import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import fastifyJwt from '@fastify/jwt'
import { authRoutes } from './routes/authenticate'
import { ZodError } from 'zod'
import { knex } from './database'

export const app = fastify()

app.register(fastifyJwt, {
  secret: 'supersecret',
  sign: {
    expiresIn: '10m',
  },
})

app.register(usersRoutes, {
  prefix: 'users',
})
app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(authRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    })
  }

  return reply.status(500).send({
    message: 'Internal Server Error.',
    error,
  })
})
