export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  rating: number;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  username: string;
  passwordHash: string;
};

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByUsername(username: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
}
