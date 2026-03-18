import type { FastifyPluginAsync } from "fastify";
import { executeSubmissionInputSchema } from "@cpv/contracts/execution";
import { parseBody } from "../../lib/http.js";
import {
  SubmissionProblemNotFoundError,
  executeSubmission,
  getProblemLeaderboard,
  listRecentSubmissions,
} from "./service.js";

export const submissionRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/submissions/execute",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = parseBody(
        executeSubmissionInputSchema,
        request.body,
        reply,
      );

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
    },
  );

  app.get<{ Querystring: { limit?: string } }>(
    "/submissions",
    { preHandler: [app.authenticate] },
    async (request) => {
      return listRecentSubmissions(
        app,
        request.user.sub,
        Number(request.query.limit),
      );
    },
  );

  app.get<{ Params: { slug: string }; Querystring: { limit?: string } }>(
    "/problems/:slug/leaderboard",
    async (request, reply) => {
      try {
        return await getProblemLeaderboard(
          app,
          request.params.slug,
          Number(request.query.limit),
        );
      } catch (error) {
        if (error instanceof SubmissionProblemNotFoundError) {
          reply.code(404);
          return { message: error.message };
        }

        throw error;
      }
    },
  );
};
