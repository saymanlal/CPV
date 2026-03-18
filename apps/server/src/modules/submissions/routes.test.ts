import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import { authResponseSchema } from "@cpv/contracts/auth";
import {
  executeSubmissionResponseSchema,
  problemLeaderboardResponseSchema,
  submissionHistoryResponseSchema,
  type ProblemLeaderboardEntry,
  type SubmissionSummary,
} from "@cpv/contracts/execution";
import { FakeExecutionEngine } from "../../test-utils/fake-execution-engine.js";

const applyTestEnv = () => {
  process.env.NODE_ENV = "test";
  process.env.LOG_LEVEL = "silent";
  process.env.DATABASE_URL =
    "postgresql://cpv:cpv@localhost:5432/cpv?schema=public";
  process.env.REDIS_URL = "redis://localhost:6379";
  process.env.PORT = "4000";
  process.env.HOST = "127.0.0.1";
  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.JWT_SECRET = "test-secret-that-is-definitely-long-enough";
  process.env.JWT_EXPIRES_IN = "7d";
  process.env.BCRYPT_SALT_ROUNDS = "10";
  process.env.EXECUTION_TIME_LIMIT_MS = "2000";
  process.env.EXECUTION_MEMORY_LIMIT_MB = "256";
  process.env.DOCKER_IMAGE_CPP = "gcc:14";
  process.env.DOCKER_IMAGE_PYTHON = "python:3.13-slim";
  process.env.DOCKER_IMAGE_JAVA = "eclipse-temurin:21";
};

const createTestApp = async (
  executionEngine = new FakeExecutionEngine(() => ({
    verdict: "ACCEPTED",
    runtimeMs: 18,
    memoryKb: 14336,
    passedCount: 2,
    totalCount: 2,
    testResults: [
      { index: 0, verdict: "ACCEPTED", runtimeMs: 18, memoryKb: 14336 },
      { index: 1, verdict: "ACCEPTED", runtimeMs: 15, memoryKb: 12000 },
    ],
  })),
) => {
  applyTestEnv();

  const [
    { buildServer },
    { InMemoryUserRepository },
    { InMemoryProblemRepository },
    { InMemorySubmissionRepository },
  ] = await Promise.all([
    import("../../app.js"),
    import("../../test-utils/in-memory-user-repository.js"),
    import("../../test-utils/in-memory-problem-repository.js"),
    import("../../test-utils/in-memory-submission-repository.js"),
  ]);

  const userRepository = new InMemoryUserRepository();
  const problemRepository = new InMemoryProblemRepository();
  const submissionRepository = new InMemorySubmissionRepository();

  await problemRepository.create({
    title: "Execution Arena",
    slug: "execution-arena",
    description: "Read integers and output their sum.",
    difficulty: "EASY",
    tags: ["math"],
    authorId: "admin-id",
    starterCode: {
      cpp: "int main(){return 0;}",
      python: "def solve():\n    pass",
      java: "public class Main { public static void main(String[] args) {} }",
    },
    testCases: [
      { input: "1 2", expectedOutput: "3", isSample: true },
      { input: "10 5", expectedOutput: "15", isSample: false },
    ],
  });

  const app = await buildServer({
    userRepository,
    problemRepository,
    submissionRepository,
    executionEngine,
  });

  return {
    app,
    problemRepository,
    submissionRepository,
    userRepository,
  };
};

const registerUser = async (
  app: Awaited<ReturnType<typeof createTestApp>>["app"],
  identity: { email: string; username: string },
) => {
  const registrationResponse = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: {
      ...identity,
      password: "battle123",
    },
  });

  assert.equal(registrationResponse.statusCode, 201);

  return authResponseSchema.parse(registrationResponse.json());
};

test("executes a submission and returns structured accepted results", async (t: TestContext) => {
  const { app } = await createTestApp();
  t.after(() => app.close());

  const auth = await registerUser(app, {
    email: "runner@example.com",
    username: "runner_user",
  });

  const executeResponse = await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
    payload: {
      problemSlug: "execution-arena",
      language: "python",
      sourceCode: "print(sum(map(int, input().split())))",
    },
  });

  assert.equal(executeResponse.statusCode, 200);
  const body = executeSubmissionResponseSchema.parse(executeResponse.json());
  assert.equal(body.verdict, "ACCEPTED");
  assert.equal(body.passedCount, 2);
  assert.equal(body.totalCount, 2);
});

test("surfaces time limit exceeded results for infinite loop edge cases", async (t: TestContext) => {
  const { app } = await createTestApp(
    new FakeExecutionEngine(() => ({
      verdict: "TIME_LIMIT_EXCEEDED",
      runtimeMs: 2000,
      memoryKb: 0,
      passedCount: 0,
      totalCount: 2,
      testResults: [
        {
          index: 0,
          verdict: "TIME_LIMIT_EXCEEDED",
          runtimeMs: 2000,
          memoryKb: 0,
          stderr: "Execution exceeded the configured time limit.",
        },
      ],
    })),
  );
  t.after(() => app.close());

  const auth = await registerUser(app, {
    email: "loop@example.com",
    username: "loop_user",
  });

  const executeResponse = await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
    payload: {
      problemSlug: "execution-arena",
      language: "python",
      sourceCode: "while True:\n    pass",
    },
  });

  assert.equal(executeResponse.statusCode, 200);
  const body = executeSubmissionResponseSchema.parse(executeResponse.json());
  assert.equal(body.verdict, "TIME_LIMIT_EXCEEDED");
});

test("surfaces memory limit exceeded results for memory abuse edge cases", async (t: TestContext) => {
  const { app } = await createTestApp(
    new FakeExecutionEngine(() => ({
      verdict: "MEMORY_LIMIT_EXCEEDED",
      runtimeMs: 400,
      memoryKb: 262144,
      passedCount: 0,
      totalCount: 2,
      testResults: [
        {
          index: 0,
          verdict: "MEMORY_LIMIT_EXCEEDED",
          runtimeMs: 400,
          memoryKb: 262144,
          stderr: "Container exceeded the memory limit.",
        },
      ],
    })),
  );
  t.after(() => app.close());

  const auth = await registerUser(app, {
    email: "memory@example.com",
    username: "memory_user",
  });

  const executeResponse = await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: {
      authorization: `Bearer ${auth.token}`,
    },
    payload: {
      problemSlug: "execution-arena",
      language: "java",
      sourceCode:
        "class Main { public static void main(String[] args) { while(true) { new int[1_000_000]; } } }",
    },
  });

  assert.equal(executeResponse.statusCode, 200);
  const body = executeSubmissionResponseSchema.parse(executeResponse.json());
  assert.equal(body.verdict, "MEMORY_LIMIT_EXCEEDED");
});

test("returns recent submissions for the authenticated user only", async (t: TestContext) => {
  const { app } = await createTestApp(
    new FakeExecutionEngine((request) => ({
      verdict: request.sourceCode.includes("wrong")
        ? "WRONG_ANSWER"
        : "ACCEPTED",
      runtimeMs: request.sourceCode.includes("fast") ? 11 : 25,
      memoryKb: request.sourceCode.includes("fast") ? 9000 : 12000,
      passedCount: request.sourceCode.includes("wrong") ? 0 : 2,
      totalCount: 2,
      testResults: [
        {
          index: 0,
          verdict: request.sourceCode.includes("wrong")
            ? "WRONG_ANSWER"
            : "ACCEPTED",
          runtimeMs: request.sourceCode.includes("fast") ? 11 : 25,
          memoryKb: request.sourceCode.includes("fast") ? 9000 : 12000,
        },
      ],
    })),
  );
  t.after(() => app.close());

  const runner = await registerUser(app, {
    email: "history@example.com",
    username: "history_user",
  });
  const outsider = await registerUser(app, {
    email: "outsider@example.com",
    username: "outsider_user",
  });

  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${runner.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "python",
      sourceCode: 'print("fast")',
    },
  });

  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${runner.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "cpp",
      sourceCode: "wrong answer",
    },
  });

  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${outsider.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "java",
      sourceCode: 'print("outsider")',
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/submissions?limit=5",
    headers: { authorization: `Bearer ${runner.token}` },
  });

  assert.equal(response.statusCode, 200);
  const body = submissionHistoryResponseSchema.parse(response.json());
  assert.equal(body.submissions.length, 2);
  assert.deepEqual(
    body.submissions.map((submission: SubmissionSummary) => submission.verdict),
    ["WRONG_ANSWER", "ACCEPTED"],
  );
  assert.ok(
    body.submissions.every(
      (submission) => submission.problemSlug === "execution-arena",
    ),
  );
});

test("returns a public problem leaderboard using each user's best accepted run", async (t: TestContext) => {
  const { app } = await createTestApp(
    new FakeExecutionEngine((request) => {
      if (request.sourceCode.includes("slow")) {
        return {
          verdict: "ACCEPTED",
          runtimeMs: 40,
          memoryKb: 15000,
          passedCount: 2,
          totalCount: 2,
          testResults: [
            { index: 0, verdict: "ACCEPTED", runtimeMs: 40, memoryKb: 15000 },
          ],
        };
      }

      if (request.sourceCode.includes("faster")) {
        return {
          verdict: "ACCEPTED",
          runtimeMs: 12,
          memoryKb: 10000,
          passedCount: 2,
          totalCount: 2,
          testResults: [
            { index: 0, verdict: "ACCEPTED", runtimeMs: 12, memoryKb: 10000 },
          ],
        };
      }

      if (request.sourceCode.includes("memory-saver")) {
        return {
          verdict: "ACCEPTED",
          runtimeMs: 12,
          memoryKb: 8000,
          passedCount: 2,
          totalCount: 2,
          testResults: [
            { index: 0, verdict: "ACCEPTED", runtimeMs: 12, memoryKb: 8000 },
          ],
        };
      }

      return {
        verdict: "WRONG_ANSWER",
        runtimeMs: 9,
        memoryKb: 7000,
        passedCount: 0,
        totalCount: 2,
        testResults: [
          { index: 0, verdict: "WRONG_ANSWER", runtimeMs: 9, memoryKb: 7000 },
        ],
      };
    }),
  );
  t.after(() => app.close());

  const alpha = await registerUser(app, {
    email: "alpha@example.com",
    username: "alpha_user",
  });
  const beta = await registerUser(app, {
    email: "beta@example.com",
    username: "beta_user",
  });

  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${alpha.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "python",
      sourceCode: "slow solution",
    },
  });
  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${alpha.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "cpp",
      sourceCode: "faster solution",
    },
  });
  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${beta.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "java",
      sourceCode: "memory-saver solution",
    },
  });
  await app.inject({
    method: "POST",
    url: "/api/submissions/execute",
    headers: { authorization: `Bearer ${beta.token}` },
    payload: {
      problemSlug: "execution-arena",
      language: "java",
      sourceCode: "wrong solution",
    },
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/problems/execution-arena/leaderboard?limit=5",
  });

  assert.equal(response.statusCode, 200);
  const body = problemLeaderboardResponseSchema.parse(response.json());
  assert.equal(body.problem.slug, "execution-arena");
  assert.deepEqual(
    body.leaderboard.map((entry) => [
      entry.username,
      entry.runtimeMs,
      entry.memoryKb,
    ]),
    [
      ["beta_user", 12, 8000],
      ["alpha_user", 12, 10000],
    ],
  );
});
