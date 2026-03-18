import type { EditorLanguage } from "@cpv/contracts/problem";
import type { SubmissionVerdict } from "@cpv/contracts/execution";

export type SubmissionRecord = {
  id: string;
  userId: string;
  problemId: string;
  language: EditorLanguage;
  sourceCode: string;
  verdict: SubmissionVerdict;
  runtimeMs: number;
  memoryKb: number;
  createdAt: Date;
};

export type CreateSubmissionRecordInput = Omit<
  SubmissionRecord,
  "createdAt" | "id"
>;

export interface SubmissionRepository {
  create(input: CreateSubmissionRecordInput): Promise<SubmissionRecord>;
  listByProblem(problemId: string, limit: number): Promise<SubmissionRecord[]>;
  listByUser(userId: string, limit: number): Promise<SubmissionRecord[]>;
}
