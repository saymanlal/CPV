import type { FastifyPluginAsync } from 'fastify';
import { loginInputSchema, registerInputSchema } from '@cpv/contracts/auth';
import { parseBody } from '../../lib/http.js';
import {
  AuthConflictError,
  AuthInvalidCredentialsError,
  AuthUnauthorizedError,
  getAuthenticatedUser,
  loginUser,
  registerUser,
} from './service.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const parsed = parseBody(registerInputSchema, request.body, reply);

    if (!parsed.ok) {
      return parsed.payload;
    }

    try {
      const result = await registerUser(app, parsed.payload);
      reply.code(201);

      return result;
    } catch (error) {
      if (error instanceof AuthConflictError) {
        reply.code(409);

        return { message: error.message };
      }

      throw error;
    }
  });

  app.post('/login', async (request, reply) => {
    const parsed = parseBody(loginInputSchema, request.body, reply);

    if (!parsed.ok) {
      return parsed.payload;
    }

    try {
      return await loginUser(app, parsed.payload);
    } catch (error) {
      if (error instanceof AuthInvalidCredentialsError) {
        reply.code(401);

        return { message: error.message };
      }

      throw error;
    }
  });

  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      return {
        user: await getAuthenticatedUser(app, request.user.sub),
      };
    } catch (error) {
      if (error instanceof AuthUnauthorizedError) {
        reply.code(401);

        return { message: error.message };
      }

      throw error;
    }
  });
};
