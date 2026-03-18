import type { ExecuteSubmissionInput, ExecuteSubmissionResponse } from '@cpv/contracts/execution';
import type { FastifyInstance } from 'fastify';
import type { SubmissionVerdict } from '@cpv/contracts/execution';

export class SubmissionProblemNotFoundError extends Error {}

export const executeSubmission = async (
  app: FastifyInstance,
  input: ExecuteSubmissionInput,
  userId: string,
): Promise<ExecuteSubmissionResponse> => {
  const problem = await app.problemRepository.findBySlug(input.problemSlug);

  if (!problem) {
    throw new SubmissionProblemNotFoundError('Problem not found.');
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

const mapVerdict = (verdict: ExecuteSubmissionResponse['verdict']): SubmissionVerdict => verdict;
