import { prisma } from '@cpv/database';
import type { CreateSubmissionRecordInput, SubmissionRecord, SubmissionRepository } from './submission-repository.js';

export class PrismaSubmissionRepository implements SubmissionRepository {
  async create(input: CreateSubmissionRecordInput): Promise<SubmissionRecord> {
    const submission = await prisma.submission.create({
      data: input,
    });

    return submission as SubmissionRecord;
  }
}
