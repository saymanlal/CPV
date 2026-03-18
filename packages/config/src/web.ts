import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const webEnv = createEnv({
  server: {},
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().min(1).default('http://localhost:4000'),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default('CPV'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  emptyStringAsUndefined: true,
});
