import fastifyJwt from '@fastify/jwt';
import type { FastifyPluginAsync } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      email: string;
      username: string;
      role: 'USER' | 'ADMIN';
    };
    user: {
      sub: string;
      email: string;
      username: string;
      role: 'USER' | 'ADMIN';
    };
  }
}

export const authPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyJwt, {
    secret: app.config.JWT_SECRET,
  });

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ message: 'Authentication required.' });
    }
  });
};
