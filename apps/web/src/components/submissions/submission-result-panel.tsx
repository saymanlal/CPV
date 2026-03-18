'use client';

import type { ExecuteSubmissionResponse } from '@cpv/contracts/execution';

const verdictStyles: Record<ExecuteSubmissionResponse['verdict'], string> = {
  ACCEPTED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  WRONG_ANSWER: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  COMPILATION_ERROR: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  RUNTIME_ERROR: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  TIME_LIMIT_EXCEEDED: 'border-orange-400/20 bg-orange-400/10 text-orange-200',
  MEMORY_LIMIT_EXCEEDED: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
  SYSTEM_ERROR: 'border-slate-400/20 bg-slate-400/10 text-slate-200',
};

export const SubmissionResultPanel = ({ result }: { result: ExecuteSubmissionResponse }) => {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Latest execution result</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Submission {result.submissionId}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${verdictStyles[result.verdict]}`}>
          {result.verdict}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Metric label="Passed" value={`${result.passedCount}/${result.totalCount}`} />
        <Metric label="Runtime" value={`${result.runtimeMs} ms`} />
        <Metric label="Memory" value={`${result.memoryKb} KB`} />
        <Metric label="Tests" value={String(result.testResults.length)} />
      </div>

      {result.compileOutput ? (
        <pre className="mt-5 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-rose-200">
          {result.compileOutput}
        </pre>
      ) : null}

      {result.testResults.length > 0 ? (
        <div className="mt-5 space-y-3">
          {result.testResults.map((testResult) => (
            <div key={testResult.index} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">Test #{testResult.index + 1}</p>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${verdictStyles[testResult.verdict]}`}>
                  {testResult.verdict}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Runtime: {testResult.runtimeMs} ms · Memory: {testResult.memoryKb} KB
              </p>
              {testResult.stderr ? (
                <pre className="mt-3 whitespace-pre-wrap text-sm text-rose-200">{testResult.stderr}</pre>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-base font-medium text-white">{value}</p>
  </div>
);
