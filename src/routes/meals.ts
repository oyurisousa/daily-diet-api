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

      return reply.status(201).send({ meal })
    },
  )

  app.put('/:id', { onRequest: [verifyJWT] }, async (request, reply) => {
    const updateMealParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = updateMealParamsSchema.parse(request.params)

    // check body

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isDiet: z.boolean().optional(),
    })

    const { name, description, isDiet } = updateMealBodySchema.parse(
      request.body,
    )

    const { sub } = request.user

    // check if user contain meal
    const meal = await knex('meals')
      .where({
        user_id: sub,
        id,
      })
      .select('*')
      .first()

    if (!meal) {
      throw new Error('meal not authorized!')
    }

    if (name) {
      meal.name = name
    }

    if (description) {
      meal.description = description
    }

    if (isDiet) {
      meal.is_diet = isDiet
    }

    const mealUpdated = await knex('meals')
      .where({ id, user_id: sub })
      .update(meal)
      .returning('*')

    return reply.send({ mealUpdated })
  })
}
