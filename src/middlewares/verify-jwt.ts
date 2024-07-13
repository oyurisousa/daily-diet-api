import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (error) {
    return reply.status(401).send({
      message: 'unauthorized!',
    })
  }
}

// 6ed9212f-1b40-4d22-a454-f7dba77ac7d6
