import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import type { EditorLanguage } from '@cpv/contracts/problem';
import type { SubmissionVerdict } from '@cpv/contracts/execution';
import { serverEnv } from '@cpv/config/server';
import type { ExecutionEngine, ExecutionRequest, ExecutionResult, ExecutionTestCase } from './types.js';

const metricMarker = '__CPV_METRICS__';

type LanguageConfig = {
  compileCommand?: string;
  image: string;
  runCommand: string;
  sourceFileName: string;
};

type CommandResult = {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stderr: string;
  stdout: string;
  timedOut: boolean;
};

type SpawnCommand = {
  args: string[];
  command: string;
  cwd?: string;
  input?: string;
  timeoutMs: number;
};

export type CommandRunner = (command: SpawnCommand) => Promise<CommandResult>;

const languageConfigs: Record<EditorLanguage, LanguageConfig> = {
  cpp: {
    sourceFileName: 'Main.cpp',
    image: serverEnv.DOCKER_IMAGE_CPP,
    compileCommand: 'g++ -std=c++20 -O2 -pipe -o main Main.cpp',
    runCommand: './main',
  },
  python: {
    sourceFileName: 'main.py',
    image: serverEnv.DOCKER_IMAGE_PYTHON,
    runCommand: 'python3 main.py',
  },
  java: {
    sourceFileName: 'Main.java',
    image: serverEnv.DOCKER_IMAGE_JAVA,
    compileCommand: 'javac Main.java',
    runCommand: 'java Main',
  },
};

export class DockerExecutionEngine implements ExecutionEngine {
  constructor(private readonly commandRunner: CommandRunner = defaultCommandRunner) {}

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const workspace = await mkdtemp(join(tmpdir(), 'cpv-exec-'));
    const language = languageConfigs[request.language];

    try {
      await writeFile(join(workspace, language.sourceFileName), request.sourceCode, 'utf8');

      if (language.compileCommand) {
        const compileResult = await this.commandRunner({
          command: 'docker',
          args: buildDockerArgs(workspace, language.image, language.compileCommand),
          timeoutMs: serverEnv.EXECUTION_TIME_LIMIT_MS + 2000,
        });

        if (compileResult.timedOut) {
          return createFailureResult('TIME_LIMIT_EXCEEDED', request.testCases.length, 'Compilation timed out.');
        }

        if (compileResult.exitCode !== 0) {
          return createFailureResult('COMPILATION_ERROR', request.testCases.length, normalizeOutput(compileResult.stderr || compileResult.stdout));
        }
      }

      const testResults = [] as ExecutionResult['testResults'];

      for (const [index, testCase] of request.testCases.entries()) {
        const startedAt = performance.now();
        const runResult = await this.commandRunner({
          command: 'docker',
          args: buildDockerArgs(workspace, language.image, wrapWithMetrics(language.runCommand)),
          input: testCase.input,
          timeoutMs: serverEnv.EXECUTION_TIME_LIMIT_MS + 1000,
        });
        const elapsedMs = Math.max(1, Math.round(performance.now() - startedAt));

        if (runResult.timedOut) {
          testResults.push({
            index,
            verdict: 'TIME_LIMIT_EXCEEDED',
            runtimeMs: serverEnv.EXECUTION_TIME_LIMIT_MS,
            memoryKb: 0,
            stderr: 'Execution exceeded the configured time limit.',
          });

          return summarizeResults(testResults, request.testCases.length);
        }

        const metrics = extractMetrics(runResult.stderr);
        const normalizedStdout = normalizeOutput(runResult.stdout);
        const normalizedExpectedOutput = normalizeOutput(testCase.expectedOutput);

        const verdict = deriveVerdict(runResult, normalizedStdout, normalizedExpectedOutput);

        testResults.push({
          index,
          verdict,
          runtimeMs: metrics.runtimeMs ?? elapsedMs,
          memoryKb: metrics.memoryKb ?? 0,
          stdout: normalizedStdout || undefined,
          stderr: normalizeOutput(metrics.stderr) || undefined,
        });

        if (verdict !== 'ACCEPTED') {
          return summarizeResults(testResults, request.testCases.length);
        }
      }

      return summarizeResults(testResults, request.testCases.length);
    } catch (error) {
      return createFailureResult(
        'SYSTEM_ERROR',
        request.testCases.length,
        error instanceof Error ? error.message : 'Execution engine failed unexpectedly.',
      );
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  }
}

const summarizeResults = (testResults: ExecutionResult['testResults'], totalCount: number): ExecutionResult => ({
  verdict: testResults.some((testResult) => testResult.verdict !== 'ACCEPTED')
    ? testResults.find((testResult) => testResult.verdict !== 'ACCEPTED')?.verdict ?? 'SYSTEM_ERROR'
    : 'ACCEPTED',
  runtimeMs: Math.max(0, ...testResults.map((testResult) => testResult.runtimeMs)),
  memoryKb: Math.max(0, ...testResults.map((testResult) => testResult.memoryKb)),
  passedCount: testResults.filter((testResult) => testResult.verdict === 'ACCEPTED').length,
  totalCount,
  compileOutput: undefined,
  testResults,
});

const createFailureResult = (
  verdict: SubmissionVerdict,
  totalCount: number,
  compileOutput?: string,
): ExecutionResult => ({
  verdict,
  runtimeMs: 0,
  memoryKb: 0,
  passedCount: 0,
  totalCount,
  compileOutput,
  testResults: [],
});


const wrapWithMetrics = (command: string) =>
  `if command -v /usr/bin/time >/dev/null 2>&1; then /usr/bin/time -f '${metricMarker}%e__%M' ${command}; else ${command}; fi`;

const buildDockerArgs = (workspace: string, image: string, command: string) => [
  'run',
  '--rm',
  '--network',
  'none',
  '--cpus',
  '1',
  '--memory',
  `${serverEnv.EXECUTION_MEMORY_LIMIT_MB}m`,
  '--pids-limit',
  '128',
  '--cap-drop',
  'ALL',
  '--security-opt',
  'no-new-privileges',
  '--workdir',
  '/workspace',
  '--mount',
  `type=bind,source=${workspace},target=/workspace`,
  image,
  '/bin/sh',
  '-lc',
  command,
];

const deriveVerdict = (runResult: CommandResult, actualOutput: string, expectedOutput: string): SubmissionVerdict => {
  const stderr = normalizeOutput(runResult.stderr).toLowerCase();

  if (stderr.includes('cannot allocate memory') || stderr.includes('oom') || stderr.includes('killed')) {
    return 'MEMORY_LIMIT_EXCEEDED';
  }

  if (runResult.exitCode !== 0) {
    return 'RUNTIME_ERROR';
  }

  if (actualOutput !== expectedOutput) {
    return 'WRONG_ANSWER';
  }

  return 'ACCEPTED';
};

const extractMetrics = (stderr: string) => {
  const lines = stderr.split('\n');
  const metricLine = lines.find((line) => line.startsWith(metricMarker));

  if (!metricLine) {
    return {
      runtimeMs: undefined,
      memoryKb: undefined,
      stderr,
    };
  }

  const [runtimeSeconds, memoryKb] = metricLine.replace(metricMarker, '').split('__');
  const stderrWithoutMetrics = lines.filter((line) => line !== metricLine).join('\n');

  return {
    runtimeMs: Math.max(1, Math.round(Number(runtimeSeconds ?? '0') * 1000)),
    memoryKb: Math.max(0, Number(memoryKb ?? '0')),
    stderr: stderrWithoutMetrics,
  };
};

const normalizeOutput = (value: string) => value.replace(/\r\n/g, '\n').trim();

const defaultCommandRunner: CommandRunner = async ({ args, command, input, timeoutMs }) => {
  return new Promise<CommandResult>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', (exitCode, signal) => {
      clearTimeout(timeout);
      resolve({
        exitCode,
        signal,
        stderr,
        stdout,
        timedOut,
      });
    });

    if (input) {
      child.stdin.write(input);
    }

    child.stdin.end();
  });
};

export const createExecutionTestCase = (input: string, expectedOutput: string): ExecutionTestCase => ({
  input,
  expectedOutput,
});
