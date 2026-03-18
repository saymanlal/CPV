import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@cpv/database';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    const startedAt = Date.now();

    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'cpv-server',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      dependencies: {
        database: 'up',
        redis: app.config.REDIS_URL ? 'configured' : 'missing',
      },
      responseTimeMs: Date.now() - startedAt,
    };
  });
};
