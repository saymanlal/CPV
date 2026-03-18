import type { ExecutionEngine, ExecutionRequest, ExecutionResult } from '../modules/execution/types.js';

export class FakeExecutionEngine implements ExecutionEngine {
  constructor(private readonly resultFactory: (request: ExecutionRequest) => Promise<ExecutionResult> | ExecutionResult) {}

  execute(request: ExecutionRequest): Promise<ExecutionResult> {
    return Promise.resolve(this.resultFactory(request));
  }
}
