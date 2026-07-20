import type { ExecutionContext, ExecutionId } from "../types";

export function createExecutionContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    requestId: crypto.randomUUID(),
    traceId: crypto.randomUUID(),
    ...overrides,
  };
}

export function generateExecutionId(): ExecutionId {
  return `exec_${crypto.randomUUID().replace(/-/g, "")}`;
}
