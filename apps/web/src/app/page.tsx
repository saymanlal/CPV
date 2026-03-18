import Link from 'next/link';
import { StatusCard } from '../components/status-card';
import { webEnv } from '@cpv/config/web';

const cards = [
  {
    label: 'Identity',
    value: 'JWT auth is live',
    hint: 'Register, log in, and validate a protected profile route without breaking the Phase 0 foundation.',
  },
  {
    label: 'Backend',
    value: 'Fastify auth routes ready',
    hint: `Phase 1 endpoints are available at ${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/auth/register, /login, and /me.`,
  },
  {
    label: 'Progression',
    value: 'Rating profile initialized',
    hint: 'Every new account starts at 1200 so future matchmaking and ELO updates can build on a stable identity layer.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-10">
      <section className="max-w-3xl">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
          Phase 1 · Auth + User System
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          CPV now has a secure identity layer for competitive play.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Typed contracts, validated auth forms, JWT-protected backend routes, and a polished profile flow prepare the
          platform for problems, battles, and matchmaking in later phases.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Create account
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:text-cyan-100"
          >
            View protected profile
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <StatusCard key={card.label} {...card} />
        ))}
      </section>
    </main>
  );
}
