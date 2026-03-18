import type { FastifyPluginAsync } from 'fastify';
import { executeSubmissionInputSchema } from '@cpv/contracts/execution';
import { parseBody } from '../../lib/http.js';
import { SubmissionProblemNotFoundError, executeSubmission } from './service.js';

export const submissionRoutes: FastifyPluginAsync = async (app) => {
  app.post('/submissions/execute', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = parseBody(executeSubmissionInputSchema, request.body, reply);

    if (!parsed.ok) {
      return parsed.payload;
    }

    try {
      return await executeSubmission(app, parsed.payload, request.user.sub);
    } catch (error) {
      if (error instanceof SubmissionProblemNotFoundError) {
        reply.code(404);
        return { message: error.message };
      }

      throw error;
    }
  });
};
