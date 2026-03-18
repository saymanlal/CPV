import Link from 'next/link';
import type { ProblemSummary } from '@cpv/contracts/problem';

const difficultyStyles: Record<ProblemSummary['difficulty'], string> = {
  EASY: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  MEDIUM: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  HARD: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

export const ProblemCard = ({ problem }: { problem: ProblemSummary }) => {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/20 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white transition group-hover:text-cyan-200">{problem.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {problem.tags.length} tags · {problem.sampleCount} sample {problem.sampleCount === 1 ? 'case' : 'cases'}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyStyles[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {problem.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
};
