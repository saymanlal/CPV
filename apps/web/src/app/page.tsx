import Link from "next/link";
import { StatusCard } from "../components/status-card";
import { webEnv } from "@cpv/config/web";

const cards = [
  {
    label: "Execution",
    value: "Judge pipeline online",
    hint: "Authenticated users can run C++, Python, and Java submissions through the sandboxed judge.",
  },
  {
    label: "History",
    value: "Recent runs on profile",
    hint: `Authenticated users can now review their latest verdicts through ${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/submissions.`,
  },
  {
    label: "Leaderboard",
    value: "Per-problem standings",
    hint: `Every problem workspace now surfaces public best-run standings from ${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/problems/:slug/leaderboard.`,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-16 lg:px-10">
      <section className="max-w-3xl">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
          Phase 4 · Submission history and leaderboards
        </span>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          CPV now turns isolated runs into trackable progress and public
          performance standings.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Beyond executing code, the platform now remembers your latest attempts
          and highlights the strongest accepted runs for each problem.
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
            View history
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
