import { buildServer } from './app.js';

const bootstrap = async () => {
  const app = await buildServer();

  try {
    await app.listen({
      host: app.config.HOST,
      port: app.config.PORT,
    });

    app.log.info(
      {
        address: `http://${app.config.HOST}:${app.config.PORT}`,
      },
      'CPV server is ready',
    );
  } catch (error) {
    app.log.error({ error }, 'failed to start server');
    process.exit(1);
  }
};

void bootstrap();
