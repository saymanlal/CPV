import type { FastifyPluginAsync } from 'fastify';
import { createProblemInputSchema } from '@cpv/contracts/problem';
import { parseBody } from '../../lib/http.js';
import { ProblemConflictError, ProblemNotFoundError, createProblem, getProblemBySlug, listProblems } from './service.js';

export const problemRoutes: FastifyPluginAsync = async (app) => {
  app.get('/problems', async () => {
    return {
      problems: await listProblems(app),
    };
  });

  app.get<{ Params: { slug: string } }>('/problems/:slug', async (request, reply) => {
    try {
      return {
        problem: await getProblemBySlug(app, request.params.slug),
      };
    } catch (error) {
      if (error instanceof ProblemNotFoundError) {
        reply.code(404);

        return { message: error.message };
      }

      throw error;
    }
  });

  app.post('/problems', { preHandler: [app.authenticate, app.requireAdmin] }, async (request, reply) => {
    const parsed = parseBody(createProblemInputSchema, request.body, reply);

    if (!parsed.ok) {
      return parsed.payload;
    }

    try {
      const problem = await createProblem(app, parsed.payload, request.user.sub);
      reply.code(201);

      return { problem };
    } catch (error) {
      if (error instanceof ProblemConflictError) {
        reply.code(409);

        return { message: error.message };
      }

      throw error;
    }
  });
};
