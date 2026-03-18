import Fastify from 'fastify';
import cors from '@fastify/cors';
import { serverEnv } from '@cpv/config/server';
import { createLogger } from '@cpv/logger';
import { healthRoutes } from './routes/health.js';
import { registerSocketServer } from './plugins/socket.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: typeof serverEnv;
  }
}

const bootstrap = async () => {
  const logger = createLogger('server', serverEnv.LOG_LEVEL);

  const app = Fastify({
    loggerInstance: logger,
    disableRequestLogging: false,
  });

  app.decorate('config', serverEnv);

  await app.register(cors, {
    origin: serverEnv.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(healthRoutes, { prefix: '/api' });

  registerSocketServer(app);

  try {
    await app.listen({
      host: serverEnv.HOST,
      port: serverEnv.PORT,
    });

    app.log.info(
      {
        address: `http://${serverEnv.HOST}:${serverEnv.PORT}`,
      },
      'CPV server is ready',
    );
  } catch (error) {
    app.log.error({ error }, 'failed to start server');
    process.exit(1);
  }
};

void bootstrap();
