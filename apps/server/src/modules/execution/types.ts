import type { EditorLanguage } from '@cpv/contracts/problem';
import type { ExecutionTestResult, SubmissionVerdict } from '@cpv/contracts/execution';

export type ExecutionTestCase = {
  input: string;
  expectedOutput: string;
};

export type ExecutionRequest = {
  language: EditorLanguage;
  sourceCode: string;
  testCases: ExecutionTestCase[];
};

export type ExecutionResult = {
  verdict: SubmissionVerdict;
  runtimeMs: number;
  memoryKb: number;
  passedCount: number;
  totalCount: number;
  compileOutput?: string;
  testResults: ExecutionTestResult[];
};

export interface ExecutionEngine {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}
