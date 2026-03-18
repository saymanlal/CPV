# CPV

Competitive Programming Versus (CPV) is being built in strict, non-breaking phases. This repository currently delivers **Phase 0: Project Foundation**.

## Included in Phase 0

- **pnpm workspace + Turborepo** monorepo orchestration.
- **`apps/web`** powered by Next.js, TypeScript, TailwindCSS, and Framer Motion.
- **`apps/server`** powered by Fastify, Socket.IO, Pino-based logging, and typed environment validation.
- **Prisma + PostgreSQL** baseline data layer with a `User` model for future auth and rating work.
- **Docker Compose** services for PostgreSQL and Redis to support local development.
- **Health check endpoint** at `GET /api/health` validating database reachability.

## Getting started

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Start infrastructure:

   ```bash
   docker compose up -d
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Generate Prisma client and sync schema:

   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. Run the platform locally:

   ```bash
   pnpm dev
   ```

## Local endpoints

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

## Repository layout

```text
apps/
  server/   Fastify API + realtime gateway
  web/      Next.js frontend
packages/
  config/   Shared environment validation
  database/ Prisma client wrapper
  logger/   Shared Pino logger factory
prisma/
  schema.prisma
```
