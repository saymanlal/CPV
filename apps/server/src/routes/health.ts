import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@cpv/database';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    const startedAt = Date.now();
    const problemCount = (await app.problemRepository.list()).length;
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'cpv-server',
      phase: 'phase-2-problem-engine',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      dependencies: {
        database: 'up',
        redis: app.config.REDIS_URL ? 'configured' : 'missing',
      },
      auth: {
        jwtConfigured: Boolean(app.config.JWT_SECRET),
      },
      problems: {
        total: problemCount,
      },
      responseTimeMs: Date.now() - startedAt,
    };
  });
};
