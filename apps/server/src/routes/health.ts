import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@cpv/database';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    const startedAt = Date.now();
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'cpv-server',
      phase: 'phase-1-auth-user-system',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      dependencies: {
        database: 'up',
        redis: app.config.REDIS_URL ? 'configured' : 'missing',
      },
      auth: {
        jwtConfigured: Boolean(app.config.JWT_SECRET),
      },
      responseTimeMs: Date.now() - startedAt,
    };
  });
};
