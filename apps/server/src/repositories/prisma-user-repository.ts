import { prisma } from '@cpv/database';
import type { CreateUserInput, UserRecord, UserRepository } from './user-repository.js';

export class PrismaUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<UserRecord> {
    return prisma.user.create({
      data: input,
    });
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
