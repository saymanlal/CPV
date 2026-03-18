import Link from "next/link";
import { ProblemCard } from "../../components/problems/problem-card";
import { fetchProblems } from "../../lib/problems";

export default async function ProblemsPage() {
  const { problems } = await fetchProblems();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
            Phase 4 · Problem engine + standings
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Choose your next coding duel.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Browse the current problem set, open the full editor workspace, and
            compare your accepted run against the live leaderboard for each
            problem.
          </p>
        </div>
        <Link
          href="/profile"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
        >
          Back to profile
        </Link>
      </div>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-slate-300">
            No problems available yet. Seed the database or create one through
            the admin API.
          </div>
        )}
      </section>
    </main>
  );
}
