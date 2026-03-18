import Link from 'next/link';
import { StatusCard } from '../components/status-card';
import { webEnv } from '@cpv/config/web';

const cards = [
  {
    label: 'Problem engine',
    value: 'Monaco workspace ready',
    hint: 'Users can browse problems, open a dedicated workspace, and draft solutions in C++, Python, or Java.',
  },
  {
    label: 'Backend',
    value: 'Problem APIs live',
    hint: `Problem endpoints are available at ${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/problems and /api/problems/:slug.`,
  },
  {
    label: 'Admin',
    value: 'Creation is protected',
    hint: 'Only admin-authenticated users can create new problems, preserving control over the competitive question pool.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-10">
      <section className="max-w-3xl">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
          Phase 2 · Problem Engine
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          CPV can now serve real problems with a proper coding workspace.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          The platform now includes a typed problem schema, protected problem creation for admins, a browsable problem library,
          and a Monaco-powered editor surface for the next execution phase.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/problems"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Explore problems
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:text-cyan-100"
          >
            Profile & auth
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
