import { ZodError, type ZodSchema } from 'zod';
import type { FastifyReply } from 'fastify';

export const parseBody = <T>(schema: ZodSchema<T>, body: unknown, reply: FastifyReply) => {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    reply.code(400);

    return {
      ok: false as const,
      payload: {
        message: 'Validation failed.',
        issues: formatZodIssues(parsed.error),
      },
    };
  }

  return {
    ok: true as const,
    payload: parsed.data,
  };
};

const formatZodIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
