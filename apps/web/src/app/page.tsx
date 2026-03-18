import { StatusCard } from '../components/status-card';
import { webEnv } from '@cpv/config/web';

const cards = [
  {
    label: 'Frontend',
    value: 'Next.js foundation ready',
    hint: 'App Router, TypeScript, TailwindCSS v4, and Framer Motion are wired for future gameplay surfaces.',
  },
  {
    label: 'Backend',
    value: 'Fastify + Socket.IO online',
    hint: `Health endpoint available at ${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/health for deploy smoke tests.`,
  },
  {
    label: 'Data Layer',
    value: 'Prisma + PostgreSQL connected',
    hint: 'A baseline User model is in place so later auth, ratings, and match history can evolve without rework.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-10">
      <section className="max-w-3xl">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
          Phase 0 · Project Foundation
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          CPV is ready for the first real-time battle systems.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          A production-minded monorepo foundation with typed environment validation, structured logging, database access,
          and a polished launchpad UI for the platform roadmap.
        </p>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <StatusCard key={card.label} {...card} />
        ))}
      </section>
    </main>
  );
}
