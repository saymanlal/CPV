'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});
import type { EditorLanguage, ProblemDetail } from '@cpv/contracts/problem';

const languageOptions: Array<{ label: string; value: EditorLanguage; monacoLanguage: string }> = [
  { label: 'C++', value: 'cpp', monacoLanguage: 'cpp' },
  { label: 'Python', value: 'python', monacoLanguage: 'python' },
  { label: 'Java', value: 'java', monacoLanguage: 'java' },
];

const difficultyStyles: Record<ProblemDetail['difficulty'], string> = {
  EASY: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  MEDIUM: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  HARD: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

export const ProblemWorkspace = ({ problem }: { problem: ProblemDetail }) => {
  const [language, setLanguage] = useState<EditorLanguage>('python');
  const [drafts, setDrafts] = useState(problem.starterCode);

  const currentLanguage = useMemo(
    () => languageOptions.find((option) => option.value === language) ?? languageOptions[1],
    [language],
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyStyles[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          {problem.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">{problem.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-300">{problem.description}</p>

        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-white">Sample test cases</h2>
          <div className="grid gap-4">
            {problem.sampleTestCases.map((testCase, index) => (
              <div key={`${problem.slug}-sample-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-slate-200">Sample {index + 1}</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <CaseBlock label="Input" value={testCase.input} />
                  <CaseBlock label="Expected output" value={testCase.expectedOutput} />
                </div>
                {testCase.explanation ? (
                  <p className="mt-4 text-sm leading-6 text-slate-400">{testCase.explanation}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Code editor</h2>
            <p className="mt-1 text-sm text-slate-400">Phase 2 editor foundation with Monaco for C++, Python, and Java.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  language === option.value ? 'bg-cyan-400 text-slate-950' : 'border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <Editor
            height="560px"
            language={currentLanguage.monacoLanguage}
            theme="vs-dark"
            value={drafts[language]}
            onChange={(value) => {
              setDrafts((current) => ({
                ...current,
                [language]: value ?? current[language],
              }));
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </article>
    </section>
  );
};

const CaseBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">{value}</pre>
  </div>
);
