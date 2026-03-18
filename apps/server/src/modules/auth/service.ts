import bcrypt from 'bcrypt';
import type { FastifyInstance } from 'fastify';
import type { AuthUser, LoginInput, RegisterInput } from '@cpv/contracts/auth';
import type { UserRecord } from '../../repositories/user-repository.js';

export class AuthConflictError extends Error {}
export class AuthInvalidCredentialsError extends Error {}
export class AuthUnauthorizedError extends Error {}

export const registerUser = async (app: FastifyInstance, input: RegisterInput) => {
  const existingByEmail = await app.userRepository.findByEmail(input.email);

  if (existingByEmail) {
    throw new AuthConflictError('An account with that email already exists.');
  }

  const existingByUsername = await app.userRepository.findByUsername(input.username);

  if (existingByUsername) {
    throw new AuthConflictError('That username is already in use.');
  }

  const passwordHash = await bcrypt.hash(input.password, app.config.BCRYPT_SALT_ROUNDS);

  const user = await app.userRepository.create({
    email: input.email.toLowerCase(),
    username: input.username,
    passwordHash,
  });

  return createAuthResult(app, user);
};

export const loginUser = async (app: FastifyInstance, input: LoginInput) => {
  const user = await app.userRepository.findByEmail(input.email);

  if (!user) {
    throw new AuthInvalidCredentialsError('Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AuthInvalidCredentialsError('Invalid email or password.');
  }

  return createAuthResult(app, user);
};

export const getAuthenticatedUser = async (app: FastifyInstance, userId: string) => {
  const user = await app.userRepository.findById(userId);

  if (!user) {
    throw new AuthUnauthorizedError('The authenticated user no longer exists.');
  }

  return toAuthUser(user);
};

const createAuthResult = async (app: FastifyInstance, user: UserRecord) => {
  const authUser = toAuthUser(user);
  const token = await app.jwt.sign(
    {
      email: authUser.email,
      username: authUser.username,
      role: authUser.role,
    },
    {
      sub: authUser.id,
      expiresIn: app.config.JWT_EXPIRES_IN,
    },
  );

  return {
    token,
    user: authUser,
  };
};

const toAuthUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  rating: user.rating,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
});
