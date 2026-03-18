import pino from 'pino';

export const createLogger = (service: string, level = process.env.LOG_LEVEL ?? 'info') =>
  pino({
    name: service,
    level,
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'SYS:standard',
              colorize: true,
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });

export type AppLogger = ReturnType<typeof createLogger>;
