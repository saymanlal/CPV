import type {
  ExecuteSubmissionInput,
  ExecuteSubmissionResponse,
  ProblemLeaderboardEntry,
  ProblemLeaderboardResponse,
  SubmissionHistoryResponse,
  SubmissionVerdict,
} from "@cpv/contracts/execution";
import type { FastifyInstance } from "fastify";
import type { ProblemRecord } from "../../repositories/problem-repository.js";

export class SubmissionProblemNotFoundError extends Error {}

const defaultLimit = 10;
const maxLimit = 50;

export const executeSubmission = async (
  app: FastifyInstance,
  input: ExecuteSubmissionInput,
  userId: string,
): Promise<ExecuteSubmissionResponse> => {
  const problem = await app.problemRepository.findBySlug(input.problemSlug);

  if (!problem) {
    throw new SubmissionProblemNotFoundError("Problem not found.");
  }

  const execution = await app.executionEngine.execute({
    language: input.language,
    sourceCode: input.sourceCode,
    testCases: problem.testCases.map((testCase) => ({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
    })),
  });

  const submission = await app.submissionRepository.create({
    userId,
    problemId: problem.id,
    language: input.language,
    sourceCode: input.sourceCode,
    verdict: mapVerdict(execution.verdict),
    runtimeMs: execution.runtimeMs,
    memoryKb: execution.memoryKb,
  });

  return {
    submissionId: submission.id,
    verdict: execution.verdict,
    runtimeMs: execution.runtimeMs,
    memoryKb: execution.memoryKb,
    passedCount: execution.passedCount,
    totalCount: execution.totalCount,
    compileOutput: execution.compileOutput,
    testResults: execution.testResults,
  };
};

export const listRecentSubmissions = async (
  app: FastifyInstance,
  userId: string,
  limit?: number,
): Promise<SubmissionHistoryResponse> => {
  const submissions = await app.submissionRepository.listByUser(
    userId,
    normalizeLimit(limit),
  );
  const problems = await app.problemRepository.list();
  const problemsById = new Map<string, ProblemRecord>(
    problems.map((problem) => [problem.id, problem]),
  );

  return {
    submissions: submissions.reduce<SubmissionHistoryResponse["submissions"]>(
      (results, submission) => {
        const problem = problemsById.get(submission.problemId);

        if (!problem) {
          return results;
        }

        results.push({
          id: submission.id,
          problemId: submission.problemId,
          problemSlug: problem.slug,
          problemTitle: problem.title,
          language: submission.language,
          verdict: submission.verdict,
          runtimeMs: submission.runtimeMs,
          memoryKb: submission.memoryKb,
          createdAt: submission.createdAt.toISOString(),
        });

        return results;
      },
      [],
    ),
  };
};

export const getProblemLeaderboard = async (
  app: FastifyInstance,
  slug: string,
  limit?: number,
): Promise<ProblemLeaderboardResponse> => {
  const problem = await app.problemRepository.findBySlug(slug);

  if (!problem) {
    throw new SubmissionProblemNotFoundError("Problem not found.");
  }

  const acceptedSubmissions = (
    await app.submissionRepository.listByProblem(problem.id, maxLimit * 4)
  ).filter((submission) => submission.verdict === "ACCEPTED");

  const bestSubmissionByUser = new Map<string, ProblemLeaderboardEntry>();

  for (const submission of acceptedSubmissions) {
    const user = await app.userRepository.findById(submission.userId);

    if (!user) {
      continue;
    }

    const candidate: ProblemLeaderboardEntry = {
      userId: user.id,
      username: user.username,
      bestSubmissionId: submission.id,
      runtimeMs: submission.runtimeMs,
      memoryKb: submission.memoryKb,
      createdAt: submission.createdAt.toISOString(),
      language: submission.language,
    };

    const current = bestSubmissionByUser.get(user.id);

    if (!current || compareLeaderboardEntries(candidate, current) < 0) {
      bestSubmissionByUser.set(user.id, candidate);
    }
  }

  return {
    problem: {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
    },
    leaderboard: Array.from(bestSubmissionByUser.values())
      .sort(compareLeaderboardEntries)
      .slice(0, normalizeLimit(limit)),
  };
};

const normalizeLimit = (limit?: number) => {
  if (!limit || Number.isNaN(limit)) {
    return defaultLimit;
  }

  return Math.max(1, Math.min(maxLimit, Math.trunc(limit)));
};

const compareLeaderboardEntries = (
  left: ProblemLeaderboardEntry,
  right: ProblemLeaderboardEntry,
) => {
  if (left.runtimeMs !== right.runtimeMs) {
    return left.runtimeMs - right.runtimeMs;
  }

  if (left.memoryKb !== right.memoryKb) {
    return left.memoryKb - right.memoryKb;
  }

  return (
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );
};

const mapVerdict = (
  verdict: ExecuteSubmissionResponse["verdict"],
): SubmissionVerdict => verdict;
