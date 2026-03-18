# CPV

Competitive Programming Versus (CPV) is being built in strict, non-breaking phases. This repository now delivers **Phase 3: Code Execution Engine** on top of the earlier foundation, auth system, and problem engine.

## Included in Phase 3

- **Monorepo foundation** with pnpm workspaces and Turborepo orchestration.
- **JWT auth + user system** with register, login, and protected profile access.
- **Problem engine** with typed Prisma schemas, browsing pages, and admin-only creation.
- **Docker-based code execution** for C++, Python, and Java.
- **Execution limits** for time and memory with network-disabled containers.
- **Submission persistence** for execution verdicts, runtime, and memory usage.
- **Frontend execution UI** wired into the Monaco problem workspace.

## API routes available now

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/problems`
- `GET /api/problems/:slug`
- `POST /api/problems` (requires admin token)
- `POST /api/submissions/execute` (requires auth token)

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

5. Seed a local admin user and starter problems:

   ```bash
   pnpm db:seed
   ```

6. Run the platform locally:

   ```bash
   pnpm dev
   ```

7. Run server tests:

   ```bash
   pnpm --filter @cpv/server test
   ```

## Seeded admin credentials

- Email: `admin@cpv.dev`
- Password: `Admin12345`

## Local endpoints

- Web: `http://localhost:3000`
- Auth UI: `http://localhost:3000/auth`
- Problems: `http://localhost:3000/problems`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

## Repository layout

```text
apps/
  server/   Fastify API + auth + problems + execution routes
  web/      Next.js frontend + auth/profile/problem/execution UI
packages/
  config/    Shared environment validation
  contracts/ Shared auth/problem/execution schemas and types
  database/  Prisma client wrapper + seed script
  logger/    Shared Pino logger factory
prisma/
  schema.prisma
```
