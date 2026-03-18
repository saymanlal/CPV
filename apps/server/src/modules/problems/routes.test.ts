import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { authResponseSchema } from '@cpv/contracts/auth';
import { problemDetailResponseSchema, problemListResponseSchema } from '@cpv/contracts/problem';

const applyTestEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
  process.env.DATABASE_URL = 'postgresql://cpv:cpv@localhost:5432/cpv?schema=public';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.PORT = '4000';
  process.env.HOST = '127.0.0.1';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.JWT_SECRET = 'test-secret-that-is-definitely-long-enough';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.BCRYPT_SALT_ROUNDS = '10';
};

const createTestApp = async () => {
  applyTestEnv();

  const [{ buildServer }, { InMemoryUserRepository }, { InMemoryProblemRepository }] = await Promise.all([
    import('../../app.js'),
    import('../../test-utils/in-memory-user-repository.js'),
    import('../../test-utils/in-memory-problem-repository.js'),
  ]);

  const userRepository = new InMemoryUserRepository();
  const problemRepository = new InMemoryProblemRepository();

  return buildServer({
    userRepository,
    problemRepository,
  });
};

const registerUser = async (
  app: Awaited<ReturnType<typeof createTestApp>>,
  payload: { email: string; username: string; password: string },
) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload,
  });

  return authResponseSchema.parse(response.json());
};

test('prevents non-admin users from creating problems', async (t: TestContext) => {
  const app = await createTestApp();
  t.after(() => app.close());

  const auth = await registerUser(app, {
    email: 'player@example.com',
    username: 'player_user',
    password: 'battle123',
  });

  const response = await app.inject({
    method: 'POST',
    url: '/api/problems',
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
    payload: {
      title: 'Two Sum Arena',
      description: 'Given an array and a target, return indices that add up to the target value.',
      difficulty: 'EASY',
      tags: ['arrays', 'hashmap'],
      testCases: [{ input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isSample: true }],
    },
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.json().message, 'Admin access is required.');
});

test('allows admins to create problems and users to fetch them', async (t: TestContext) => {
  const app = await createTestApp();
  t.after(() => app.close());

  const adminRegistration = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      email: 'admin@example.com',
      username: 'admin_user',
      password: 'battle123',
    },
  });

  const adminAuth = authResponseSchema.parse(adminRegistration.json());
  const adminUser = await app.userRepository.findById(adminAuth.user.id);

  if (!adminUser) {
    throw new Error('Expected admin user to exist in test repository.');
  }

  adminUser.role = 'ADMIN';

  const createResponse = await app.inject({
    method: 'POST',
    url: '/api/problems',
    headers: {
      authorization: `Bearer ${await app.jwt.sign({ email: adminUser.email, username: adminUser.username, role: 'ADMIN' }, { sub: adminUser.id })}`,
    },
    payload: {
      title: 'Palindrome Sprint',
      description: 'Determine whether each input string is a palindrome while ignoring non-alphanumeric characters.',
      difficulty: 'EASY',
      tags: ['strings', 'two-pointers'],
      starterCode: {
        cpp: 'int main() { return 0; }',
        python: 'def solve():\n    pass',
        java: 'public class Main { public static void main(String[] args) {} }',
      },
      testCases: [
        { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true', isSample: true },
        { input: 'race a car', expectedOutput: 'false', isSample: true },
      ],
    },
  });

  assert.equal(createResponse.statusCode, 201);
  const createdProblem = problemDetailResponseSchema.parse(createResponse.json());
  assert.equal(createdProblem.problem.slug, 'palindrome-sprint');
  assert.equal(createdProblem.problem.sampleTestCases.length, 2);

  const listResponse = await app.inject({ method: 'GET', url: '/api/problems' });
  assert.equal(listResponse.statusCode, 200);
  const listBody = problemListResponseSchema.parse(listResponse.json());
  assert.equal(listBody.problems.length, 1);
  assert.equal(listBody.problems[0]?.slug, 'palindrome-sprint');

  const detailResponse = await app.inject({ method: 'GET', url: '/api/problems/palindrome-sprint' });
  assert.equal(detailResponse.statusCode, 200);
  const detailBody = problemDetailResponseSchema.parse(detailResponse.json());
  assert.equal(detailBody.problem.title, 'Palindrome Sprint');
});
