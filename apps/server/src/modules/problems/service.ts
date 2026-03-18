import type { CreateProblemInput, ProblemDetail, ProblemSummary, StarterCode } from '@cpv/contracts/problem';
import type { FastifyInstance } from 'fastify';
import type { ProblemRecord } from '../../repositories/problem-repository.js';

export class ProblemConflictError extends Error {}
export class ProblemNotFoundError extends Error {}

const defaultStarterCode: StarterCode = {
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n\n  return 0;\n}\n',
  python: 'def solve() -> None:\n    pass\n\n\nif __name__ == "__main__":\n    solve()\n',
  java: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n    }\n}\n',
};

export const createProblem = async (app: FastifyInstance, input: CreateProblemInput, authorId: string) => {
  const slug = normalizeSlug(input.slug ?? input.title);
  const existingProblem = await app.problemRepository.findBySlug(slug);

  if (existingProblem) {
    throw new ProblemConflictError('A problem with that slug already exists.');
  }

  const createdProblem = await app.problemRepository.create({
    ...input,
    slug,
    authorId,
    tags: input.tags.map(normalizeTag),
    starterCode: input.starterCode ?? defaultStarterCode,
  });

  return toProblemDetail(createdProblem);
};

export const listProblems = async (app: FastifyInstance) => {
  const problems = await app.problemRepository.list();

  return problems.map(toProblemSummary);
};

export const getProblemBySlug = async (app: FastifyInstance, slug: string) => {
  const problem = await app.problemRepository.findBySlug(slug);

  if (!problem) {
    throw new ProblemNotFoundError('Problem not found.');
  }

  return toProblemDetail(problem);
};

const toProblemSummary = (problem: ProblemRecord): ProblemSummary => ({
  id: problem.id,
  title: problem.title,
  slug: problem.slug,
  difficulty: problem.difficulty,
  tags: problem.tags,
  sampleCount: problem.testCases.filter((testCase) => testCase.isSample).length,
  createdAt: problem.createdAt.toISOString(),
});

const toProblemDetail = (problem: ProblemRecord): ProblemDetail => ({
  id: problem.id,
  title: problem.title,
  slug: problem.slug,
  description: problem.description,
  difficulty: problem.difficulty,
  tags: problem.tags,
  starterCode: problem.starterCode,
  sampleTestCases: problem.testCases
    .filter((testCase) => testCase.isSample)
    .map((testCase) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      explanation: testCase.explanation ?? undefined,
    })),
  createdAt: problem.createdAt.toISOString(),
  updatedAt: problem.updatedAt.toISOString(),
});

const normalizeTag = (tag: string) => tag.trim().toLowerCase();

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
