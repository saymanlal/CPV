import type { CreateProblemInput, ProblemDifficulty, StarterCode } from '@cpv/contracts/problem';

export type ProblemTestCaseRecord = {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string | null;
  isSample: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProblemRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  starterCode: StarterCode;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  testCases: ProblemTestCaseRecord[];
};

export type CreateProblemRecordInput = Omit<CreateProblemInput, 'slug' | 'starterCode'> & {
  authorId: string;
  slug: string;
  starterCode: StarterCode;
};

export interface ProblemRepository {
  create(input: CreateProblemRecordInput): Promise<ProblemRecord>;
  findBySlug(slug: string): Promise<ProblemRecord | null>;
  list(): Promise<ProblemRecord[]>;
}
