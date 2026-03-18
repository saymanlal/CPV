import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { authResponseSchema, meResponseSchema } from '@cpv/contracts/auth';

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

  const [{ buildServer }, { InMemoryUserRepository }] = await Promise.all([
    import('../../app.js'),
    import('../../test-utils/in-memory-user-repository.js'),
  ]);

  return buildServer({
    userRepository: new InMemoryUserRepository(),
  });
};

test('registers a user and returns a JWT plus default profile data', async (t: TestContext) => {
  const app = await createTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      email: 'player1@example.com',
      username: 'player_one',
      password: 'battle123',
    },
  });

  assert.equal(response.statusCode, 201);

  const body = authResponseSchema.parse(response.json());
  assert.equal(body.user.rating, 1200);
  assert.equal(body.user.email, 'player1@example.com');
  assert.equal(body.user.role, 'USER');
});

test('prevents duplicate email registration', async (t: TestContext) => {
  const app = await createTestApp();
  t.after(() => app.close());

  const payload = {
    email: 'duplicate@example.com',
    username: 'duplicate_user',
    password: 'battle123',
  };

  await app.inject({ method: 'POST', url: '/api/auth/register', payload });

  const duplicateResponse = await app.inject({ method: 'POST', url: '/api/auth/register', payload });

  assert.equal(duplicateResponse.statusCode, 409);
  assert.equal(duplicateResponse.json().message, 'An account with that email already exists.');
});

test('logs in and allows access to the protected profile route', async (t: TestContext) => {
  const app = await createTestApp();
  t.after(() => app.close());

  await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      email: 'login@example.com',
      username: 'login_user',
      password: 'battle123',
    },
  });

  const loginResponse = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: 'login@example.com',
      password: 'battle123',
    },
  });

  assert.equal(loginResponse.statusCode, 200);

  const auth = authResponseSchema.parse(loginResponse.json());

  const meResponse = await app.inject({
    method: 'GET',
    url: '/api/auth/me',
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
  });

  assert.equal(meResponse.statusCode, 200);

  const meBody = meResponseSchema.parse(meResponse.json());
  assert.equal(meBody.user.username, 'login_user');
});

test('rejects invalid login credentials and missing tokens', async (t: TestContext) => {
  const app = await createTestApp();
  t.after(() => app.close());

  await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      email: 'guard@example.com',
      username: 'guard_user',
      password: 'battle123',
    },
  });

  const invalidLogin = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: 'guard@example.com',
      password: 'wrongpass1',
    },
  });

  assert.equal(invalidLogin.statusCode, 401);
  assert.equal(invalidLogin.json().message, 'Invalid email or password.');

  const protectedResponse = await app.inject({
    method: 'GET',
    url: '/api/auth/me',
  });

  assert.equal(protectedResponse.statusCode, 401);
  assert.equal(protectedResponse.json().message, 'Authentication required.');
});
