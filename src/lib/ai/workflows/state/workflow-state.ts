import type { WorkflowExecution, WorkflowStatus } from "../types";

export interface WorkflowStateManager {
  initialize(execution: WorkflowExecution): void;
  updateStatus(execution: WorkflowExecution, status: WorkflowStatus): void;
  updateNodeResult(execution: WorkflowExecution, result: { nodeId: string; status: string; output?: Record<string, unknown>; error?: string }): void;
  getExecution(executionId: string): WorkflowExecution | undefined;
}

export class InMemoryWorkflowStateManager implements WorkflowStateManager {
  private executions: Map<string, WorkflowExecution> = new Map();

  initialize(execution: WorkflowExecution): void {
    this.executions.set(execution.executionId, execution);
  }

  updateStatus(execution: WorkflowExecution, status: WorkflowStatus): void {
    execution.status = status;
    if (status === "completed" || status === "failed" || status === "cancelled") {
      execution.completedAt = new Date().toISOString();
    }
  }

  updateNodeResult(execution: WorkflowExecution, update: { nodeId: string; status: string; output?: Record<string, unknown>; error?: string }): void {
    const existing = execution.results.get(update.nodeId);
    if (existing) {
      existing.status = update.status as "completed" | "failed" | "skipped" | "waiting_approval";
      if (update.output) existing.output = update.output;
      if (update.error) existing.error = update.error;
      existing.completedAt = new Date().toISOString();
    }
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }
}
