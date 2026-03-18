import { z } from 'zod';

export const problemDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const editorLanguageSchema = z.enum(['cpp', 'python', 'java']);

export const starterCodeSchema = z.object({
  cpp: z.string().min(1),
  python: z.string().min(1),
  java: z.string().min(1),
});

export const problemTestCaseSchema = z.object({
  input: z.string().min(1, 'Test case input is required.'),
  expectedOutput: z.string().min(1, 'Expected output is required.'),
  explanation: z.string().max(500).optional(),
  isSample: z.boolean().default(false),
});

export const createProblemInputSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z
    .string()
    .min(3)
    .max(140)
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.')
    .optional(),
  description: z.string().min(20).max(10000),
  difficulty: problemDifficultySchema,
  tags: z.array(z.string().min(1).max(30)).min(1).max(8),
  starterCode: starterCodeSchema.optional(),
  testCases: z.array(problemTestCaseSchema).min(1).max(20),
});

export const problemSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  difficulty: problemDifficultySchema,
  tags: z.array(z.string()),
  sampleCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const problemDetailSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  difficulty: problemDifficultySchema,
  tags: z.array(z.string()),
  starterCode: starterCodeSchema,
  sampleTestCases: z.array(
    z.object({
      input: z.string().min(1),
      expectedOutput: z.string().min(1),
      explanation: z.string().optional(),
    }),
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const problemListResponseSchema = z.object({
  problems: z.array(problemSummarySchema),
});

export const problemDetailResponseSchema = z.object({
  problem: problemDetailSchema,
});

export type ProblemDifficulty = z.infer<typeof problemDifficultySchema>;
export type EditorLanguage = z.infer<typeof editorLanguageSchema>;
export type StarterCode = z.infer<typeof starterCodeSchema>;
export type ProblemTestCaseInput = z.infer<typeof problemTestCaseSchema>;
export type CreateProblemInput = z.infer<typeof createProblemInputSchema>;
export type ProblemSummary = z.infer<typeof problemSummarySchema>;
export type ProblemDetail = z.infer<typeof problemDetailSchema>;
export type ProblemListResponse = z.infer<typeof problemListResponseSchema>;
export type ProblemDetailResponse = z.infer<typeof problemDetailResponseSchema>;
