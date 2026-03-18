import { z } from "zod";
import { editorLanguageSchema } from "./problem";

export const submissionVerdictSchema = z.enum([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILATION_ERROR",
  "RUNTIME_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "SYSTEM_ERROR",
]);

export const executeSubmissionInputSchema = z.object({
  problemSlug: z.string().min(1),
  language: editorLanguageSchema,
  sourceCode: z.string().min(1).max(100000),
});

export const executionTestResultSchema = z.object({
  index: z.number().int().nonnegative(),
  verdict: submissionVerdictSchema,
  runtimeMs: z.number().int().nonnegative(),
  memoryKb: z.number().int().nonnegative(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
});

export const executeSubmissionResponseSchema = z.object({
  submissionId: z.string().min(1),
  verdict: submissionVerdictSchema,
  runtimeMs: z.number().int().nonnegative(),
  memoryKb: z.number().int().nonnegative(),
  passedCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
  compileOutput: z.string().optional(),
  testResults: z.array(executionTestResultSchema),
});

export const submissionSummarySchema = z.object({
  id: z.string().min(1),
  problemId: z.string().min(1),
  problemSlug: z.string().min(1),
  problemTitle: z.string().min(1),
  language: editorLanguageSchema,
  verdict: submissionVerdictSchema,
  runtimeMs: z.number().int().nonnegative(),
  memoryKb: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const submissionHistoryResponseSchema = z.object({
  submissions: z.array(submissionSummarySchema),
});

export const problemLeaderboardEntrySchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  bestSubmissionId: z.string().min(1),
  runtimeMs: z.number().int().nonnegative(),
  memoryKb: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  language: editorLanguageSchema,
});

export const problemLeaderboardResponseSchema = z.object({
  problem: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
  }),
  leaderboard: z.array(problemLeaderboardEntrySchema),
});

export type SubmissionVerdict = z.infer<typeof submissionVerdictSchema>;
export type ExecuteSubmissionInput = z.infer<
  typeof executeSubmissionInputSchema
>;
export type ExecutionTestResult = z.infer<typeof executionTestResultSchema>;
export type ExecuteSubmissionResponse = z.infer<
  typeof executeSubmissionResponseSchema
>;
export type SubmissionSummary = z.infer<typeof submissionSummarySchema>;
export type SubmissionHistoryResponse = z.infer<
  typeof submissionHistoryResponseSchema
>;
export type ProblemLeaderboardEntry = z.infer<
  typeof problemLeaderboardEntrySchema
>;
export type ProblemLeaderboardResponse = z.infer<
  typeof problemLeaderboardResponseSchema
>;
