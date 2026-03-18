import Link from "next/link";
import { ProblemLeaderboard } from "../../../components/problems/problem-leaderboard";
import { ProblemWorkspace } from "../../../components/problems/problem-workspace";
import { fetchProblem, fetchProblemLeaderboard } from "../../../lib/problems";

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ problem }, leaderboard] = await Promise.all([
    fetchProblem(slug),
    fetchProblemLeaderboard(slug),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-[1500px] px-6 py-12 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            Phase 4 · Performance leaderboards
          </span>
          <p className="mt-3 text-sm text-slate-400">
            Read the prompt, inspect the sample cases, submit code, and compare
            accepted performance against the fastest public runs.
          </p>
        </div>
        <Link
          href="/problems"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
        >
          Back to problems
        </Link>
      </div>

      <div className="space-y-6">
        <ProblemWorkspace problem={problem} />
        <ProblemLeaderboard leaderboard={leaderboard} />
      </div>
    </main>
  );
}
