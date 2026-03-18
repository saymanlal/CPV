import { prisma } from "@cpv/database";
import type {
  CreateSubmissionRecordInput,
  SubmissionRecord,
  SubmissionRepository,
} from "./submission-repository.js";

export class PrismaSubmissionRepository implements SubmissionRepository {
  async create(input: CreateSubmissionRecordInput): Promise<SubmissionRecord> {
    const submission = await prisma.submission.create({
      data: input,
    });

    return submission as SubmissionRecord;
  }

  async listByProblem(
    problemId: string,
    limit: number,
  ): Promise<SubmissionRecord[]> {
    const submissions = await prisma.submission.findMany({
      where: { problemId },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });

    return submissions as SubmissionRecord[];
  }

  async listByUser(userId: string, limit: number): Promise<SubmissionRecord[]> {
    const submissions = await prisma.submission.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
    });

    return submissions as SubmissionRecord[];
  }
}
