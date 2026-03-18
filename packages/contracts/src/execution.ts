import { z } from 'zod';
import { editorLanguageSchema } from './problem';

export const submissionVerdictSchema = z.enum([
  'ACCEPTED',
  'WRONG_ANSWER',
  'COMPILATION_ERROR',
  'RUNTIME_ERROR',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'SYSTEM_ERROR',
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

export type SubmissionVerdict = z.infer<typeof submissionVerdictSchema>;
export type ExecuteSubmissionInput = z.infer<typeof executeSubmissionInputSchema>;
export type ExecutionTestResult = z.infer<typeof executionTestResultSchema>;
export type ExecuteSubmissionResponse = z.infer<typeof executeSubmissionResponseSchema>;
