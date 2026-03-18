import type { ProblemLeaderboardResponse } from "@cpv/contracts/execution";

export const ProblemLeaderboard = ({
  leaderboard,
}: {
  leaderboard: ProblemLeaderboardResponse;
}) => {
  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Leaderboard</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Best accepted runs for{" "}
            <span className="font-medium text-white">
              {leaderboard.problem.title}
            </span>
            , ranked by runtime and then memory.
          </p>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
          Phase 4
        </span>
      </div>

      {leaderboard.leaderboard.length > 0 ? (
        <div className="mt-6 space-y-3">
          {leaderboard.leaderboard.map((entry, index) => (
            <div
              key={entry.bestSubmissionId}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <div>
                <p className="text-sm text-slate-400">#{index + 1}</p>
                <p className="mt-1 text-base font-semibold text-white">
                  {entry.username}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {entry.language}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-emerald-300">
                  {entry.runtimeMs} ms
                </p>
                <p className="mt-1 text-slate-400">{entry.memoryKb} KB</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
          No accepted submissions have landed for this problem yet. Be the first
          to post a benchmark-worthy run.
        </p>
      )}
    </aside>
  );
};
