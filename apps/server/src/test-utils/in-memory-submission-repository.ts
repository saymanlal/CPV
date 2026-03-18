import { randomUUID } from 'node:crypto';
import type { CreateSubmissionRecordInput, SubmissionRecord, SubmissionRepository } from '../repositories/submission-repository.js';

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
}
