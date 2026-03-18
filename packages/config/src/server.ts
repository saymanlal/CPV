import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { sharedServerSchema } from './shared';

export const serverEnv = createEnv({
  server: {
    ...sharedServerSchema,
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    HOST: z.string().min(1).default('0.0.0.0'),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long.'),
    JWT_EXPIRES_IN: z.string().min(2).default('7d'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
    EXECUTION_TIME_LIMIT_MS: z.coerce.number().int().min(250).max(10000).default(2000),
    EXECUTION_MEMORY_LIMIT_MB: z.coerce.number().int().min(64).max(1024).default(256),
    DOCKER_IMAGE_CPP: z.string().min(1).default('gcc:14'),
    DOCKER_IMAGE_PYTHON: z.string().min(1).default('python:3.13-slim'),
    DOCKER_IMAGE_JAVA: z.string().min(1).default('eclipse-temurin:21'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
