import { prisma } from '@cpv/database';
import type { CreateProblemRecordInput, ProblemRecord, ProblemRepository } from './problem-repository.js';

const includeTestCases = {
  testCases: {
    orderBy: {
      orderIndex: 'asc' as const,
    },
  },
};

export class PrismaProblemRepository implements ProblemRepository {
  async create(input: CreateProblemRecordInput): Promise<ProblemRecord> {
    const createdProblem = await prisma.problem.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        difficulty: input.difficulty,
        tags: input.tags,
        starterCode: input.starterCode,
        authorId: input.authorId,
        testCases: {
          create: input.testCases.map((testCase, index) => ({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            explanation: testCase.explanation,
            isSample: testCase.isSample,
            orderIndex: index,
          })),
        },
      },
      include: includeTestCases,
    });

    return createdProblem as ProblemRecord;
  }

  async findBySlug(slug: string): Promise<ProblemRecord | null> {
    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: includeTestCases,
    });

    return problem as ProblemRecord | null;
  }

  async list(): Promise<ProblemRecord[]> {
    const problems = await prisma.problem.findMany({
      include: includeTestCases,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return problems as ProblemRecord[];
  }
}
