"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SubmissionSummary } from "@cpv/contracts/execution";
import { fetchSubmissionHistory } from "../../lib/submissions";

type SubmissionHistoryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; submissions: SubmissionSummary[] };

const verdictStyles: Record<SubmissionSummary["verdict"], string> = {
  ACCEPTED: "text-emerald-300",
  WRONG_ANSWER: "text-amber-300",
  COMPILATION_ERROR: "text-rose-300",
  RUNTIME_ERROR: "text-rose-300",
  TIME_LIMIT_EXCEEDED: "text-orange-300",
  MEMORY_LIMIT_EXCEEDED: "text-orange-300",
  SYSTEM_ERROR: "text-fuchsia-300",
};

export const RecentSubmissionsPanel = () => {
  const [state, setState] = useState<SubmissionHistoryState>({
    status: "loading",
  });

  useEffect(() => {
    void fetchSubmissionHistory()
      .then((response) => {
        setState({ status: "ready", submissions: response.submissions });
      })
      .catch((error) => {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load recent submissions.",
        });
      });
  }, []);

  if (state.status === "loading") {
    return (
      <PanelMessage
        title="Loading recent submissions"
        body="Fetching your latest runs, verdicts, and timings from the judge."
      />
    );
  }

  if (state.status === "error") {
    return (
      <PanelMessage
        title="Submission history unavailable"
        body={state.message}
      />
    );
  }

  if (state.submissions.length === 0) {
    return (
      <PanelMessage
        title="No submissions yet"
        body="Run a solution from any problem workspace and your recent attempts will appear here."
      />
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Recent submissions
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Track your last ten judged runs to spot consistency, regressions,
            and fastest accepted solutions.
          </p>
        </div>
        <Link
          href="/problems"
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
        >
          Solve more
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Problem</th>
              <th className="px-4 py-3 font-medium">Verdict</th>
              <th className="px-4 py-3 font-medium">Language</th>
              <th className="px-4 py-3 font-medium">Runtime</th>
              <th className="px-4 py-3 font-medium">Memory</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
            {state.submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/problems/${submission.problemSlug}`}
                    className="font-medium text-white hover:text-cyan-200"
                  >
                    {submission.problemTitle}
                  </Link>
                </td>
                <td
                  className={`px-4 py-3 font-medium ${verdictStyles[submission.verdict]}`}
                >
                  {formatVerdict(submission.verdict)}
                </td>
                <td className="px-4 py-3 uppercase text-slate-300">
                  {submission.language}
                </td>
                <td className="px-4 py-3">{submission.runtimeMs} ms</td>
                <td className="px-4 py-3">{submission.memoryKb} KB</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(submission.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const PanelMessage = ({ body, title }: { body: string; title: string }) => (
  <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
  </section>
);

const formatVerdict = (verdict: SubmissionSummary["verdict"]) =>
  verdict.replace(/_/g, " ");
