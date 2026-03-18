import { randomUUID } from "node:crypto";
import type {
  CreateSubmissionRecordInput,
  SubmissionRecord,
  SubmissionRepository,
} from "../repositories/submission-repository.js";

export class InMemorySubmissionRepository implements SubmissionRepository {
  private readonly submissions: SubmissionRecord[] = [];

  async create(input: CreateSubmissionRecordInput): Promise<SubmissionRecord> {
    const submission: SubmissionRecord = {
      id: randomUUID(),
      createdAt: new Date(),
      ...input,
    };

    this.submissions.push(submission);

    return submission;
  }

  async listByProblem(
    problemId: string,
    limit: number,
  ): Promise<SubmissionRecord[]> {
    return this.submissions
      .filter((submission) => submission.problemId === problemId)
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      )
      .slice(0, limit);
  }

  async listByUser(userId: string, limit: number): Promise<SubmissionRecord[]> {
    return this.submissions
      .filter((submission) => submission.userId === userId)
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      )
      .slice(0, limit);
  }
}
