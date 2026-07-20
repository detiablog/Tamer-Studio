import type { ExecutionSnapshot } from "../types";

export class DefaultExecutionSnapshot implements ExecutionSnapshot {
  readonly executionId: string;
  readonly timestamp: string;
  readonly workflowState: Record<string, unknown>;
  readonly nodeStates: Map<string, Record<string, unknown>>;
  readonly memory: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;

  constructor(params: {
    executionId: string;
    workflowState: Record<string, unknown>;
    nodeStates: Map<string, Record<string, unknown>>;
    memory: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }) {
    this.executionId = params.executionId;
    this.timestamp = new Date().toISOString();
    this.workflowState = params.workflowState;
    this.nodeStates = params.nodeStates;
    this.memory = params.memory;
    this.metadata = params.metadata ?? {};
  }
}
