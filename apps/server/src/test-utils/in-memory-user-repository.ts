import { randomUUID } from 'node:crypto';
import type { CreateUserInput, UserRecord, UserRepository } from '../repositories/user-repository.js';

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  async create(input: CreateUserInput): Promise<UserRecord> {
    const now = new Date();
    const user: UserRecord = {
      id: randomUUID(),
      email: input.email.toLowerCase(),
      username: input.username,
      passwordHash: input.passwordHash,
      rating: 1200,
      role: 'USER',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);

    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const normalizedEmail = email.toLowerCase();

    return Array.from(this.users.values()).find((user) => user.email === normalizedEmail) ?? null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    return Array.from(this.users.values()).find((user) => user.username === username) ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }
}
