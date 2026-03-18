import Link from 'next/link';
import { ProfilePanel } from '../../components/auth/profile-panel';

export default function ProfilePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            Protected profile
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Your CPV identity</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            This page confirms that JWT validation is working before battles begin, and it links naturally into the new problem engine phase.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/problems" className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300">
            Browse problems
          </Link>
          <Link href="/auth" className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-white">
            Switch account
          </Link>
        </div>
      </div>

      <ProfilePanel />
    </main>
  );
}
