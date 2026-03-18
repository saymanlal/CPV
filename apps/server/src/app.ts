import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { serverEnv } from '@cpv/config/server';
import { createLogger } from '@cpv/logger';
import type { AppLogger } from '@cpv/logger';
import { authPlugin } from './plugins/auth.js';
import { registerSocketServer } from './plugins/socket.js';
import { PrismaProblemRepository } from './repositories/prisma-problem-repository.js';
import { PrismaUserRepository } from './repositories/prisma-user-repository.js';
import type { ProblemRepository } from './repositories/problem-repository.js';
import type { UserRepository } from './repositories/user-repository.js';
import { authRoutes } from './modules/auth/routes.js';
import { problemRoutes } from './modules/problems/routes.js';
import { healthRoutes } from './routes/health.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<unknown>;
    requireAdmin: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<unknown>;
    config: typeof serverEnv;
    problemRepository: ProblemRepository;
    userRepository: UserRepository;
  }
}

export type BuildServerOptions = {
  logger?: AppLogger;
  problemRepository?: ProblemRepository;
  userRepository?: UserRepository;
};

export const buildServer = async (options: BuildServerOptions = {}): Promise<FastifyInstance> => {
  const logger = options.logger ?? createLogger('server', serverEnv.LOG_LEVEL);
  const app = Fastify({
    loggerInstance: logger,
    disableRequestLogging: false,
  });

  app.decorate('config', serverEnv);
  app.decorate('userRepository', options.userRepository ?? new PrismaUserRepository());
  app.decorate('problemRepository', options.problemRepository ?? new PrismaProblemRepository());

  await app.register(cors, {
    origin: serverEnv.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(authPlugin);
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(problemRoutes, { prefix: '/api' });

  registerSocketServer(app);

  return app;
};
