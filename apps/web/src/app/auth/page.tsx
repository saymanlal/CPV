import Link from 'next/link';
import { FormShell } from '../../components/auth/form-shell';

export default function AuthPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_480px] lg:px-10">
      <section className="max-w-2xl self-center">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
          Secure entry to the arena
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Sign in for head-to-head coding battles.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Phase 1 focuses on a stable identity system: clean forms, typed validation, password hashing, JWT sessions, and
          a protected profile route plus a browsable problem library and editor workspace.
        </p>
        <div className="mt-8 space-y-4 text-sm leading-7 text-slate-400">
          <p>• Every new user starts at a rating of 1200.</p>
          <p>• Passwords are hashed on the server before storage.</p>
          <p>• Protected routes require a valid bearer token.</p>
        </div>
        <p className="mt-8 text-sm text-slate-400">
          Already exploring the platform? <Link href="/" className="text-cyan-300 hover:text-cyan-200">Back to home</Link>.
        </p>
      </section>

      <section className="self-center">
        <FormShell />
      </section>
    </main>
  );
}
