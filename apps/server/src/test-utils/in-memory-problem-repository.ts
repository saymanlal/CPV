import { randomUUID } from 'node:crypto';
import type { CreateProblemRecordInput, ProblemRecord, ProblemRepository, ProblemTestCaseRecord } from '../repositories/problem-repository.js';

export class InMemoryProblemRepository implements ProblemRepository {
  private readonly problems = new Map<string, ProblemRecord>();

  async create(input: CreateProblemRecordInput): Promise<ProblemRecord> {
    const now = new Date();
    const testCases: ProblemTestCaseRecord[] = input.testCases.map((testCase, index) => ({
      id: randomUUID(),
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      explanation: testCase.explanation ?? null,
      isSample: testCase.isSample,
      orderIndex: index,
      createdAt: now,
      updatedAt: now,
    }));

    const problem: ProblemRecord = {
      id: randomUUID(),
      title: input.title,
      slug: input.slug,
      description: input.description,
      difficulty: input.difficulty,
      tags: input.tags,
      starterCode: input.starterCode,
      createdAt: now,
      updatedAt: now,
      authorId: input.authorId,
      testCases,
    };

    this.problems.set(problem.slug, problem);

    return problem;
  }

  async findBySlug(slug: string): Promise<ProblemRecord | null> {
    return this.problems.get(slug) ?? null;
  }

  async list(): Promise<ProblemRecord[]> {
    return Array.from(this.problems.values()).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }
}
