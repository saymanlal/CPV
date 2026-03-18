import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { sharedServerSchema } from './shared';

export const serverEnv = createEnv({
  server: {
    ...sharedServerSchema,
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    HOST: z.string().min(1).default('0.0.0.0'),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
    JWT_SECRET: z.string().min(1).default('replace-me-in-phase-1'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
