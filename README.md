# CPV

Competitive Programming Versus (CPV) is being built in strict, non-breaking phases. This repository now delivers **Phase 1: Auth + User System** on top of the original Phase 0 foundation.

## Included in Phase 1

- **Monorepo foundation** with pnpm workspaces and Turborepo orchestration.
- **`apps/web`** built with Next.js, TypeScript, TailwindCSS, and Framer Motion.
- **`apps/server`** built with Fastify, Socket.IO, typed environment validation, and structured logging.
- **JWT authentication** with register, login, and protected `me` endpoints.
- **Password hashing with bcrypt** before persistence.
- **Prisma + PostgreSQL** user model including rating, role, and hashed password storage.
- **Shared contracts** for auth request/response validation across frontend and backend.
- **Docker Compose** services for PostgreSQL and Redis to support local development.

## API routes available now

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

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

6. Run Phase 1 auth tests:

   ```bash
   pnpm --filter @cpv/server test
   ```

## Local endpoints

- Web: `http://localhost:3000`
- Auth UI: `http://localhost:3000/auth`
- Protected profile: `http://localhost:3000/profile`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

## Repository layout

```text
apps/
  server/   Fastify API + realtime gateway + auth routes
  web/      Next.js frontend + auth/profile UI
packages/
  config/    Shared environment validation
  contracts/ Shared auth schemas and types
  database/  Prisma client wrapper
  logger/    Shared Pino logger factory
prisma/
  schema.prisma
```
