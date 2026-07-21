import type { ExecutionSnapshot, RollbackManager, WorkflowMemory } from "../types";
import { DefaultExecutionSnapshot } from "./snapshot";

export class DefaultRollbackManager implements RollbackManager {
  createSnapshot(execution: unknown): ExecutionSnapshot {
    const exec = execution as Record<string, unknown>;
    const nodeStates = new Map<string, Record<string, unknown>>();

    if (exec.results && typeof exec.results === "object" && "entries" in exec.results) {
      const entries = (exec.results as Record<string, unknown>).entries as Iterable<[string, unknown]>;
      for (const [nodeId, result] of entries) {
        nodeStates.set(nodeId, result as Record<string, unknown>);
      }
    }

    const memory = (exec.memory as WorkflowMemory)?.entries?.() ?? {};

    return new DefaultExecutionSnapshot({
      executionId: exec.executionId as string,
      workflowState: exec as Record<string, unknown>,
      nodeStates,
      memory,
      metadata: {
        status: exec.status as string,
        startedAt: exec.startedAt as string,
        completedAt: exec.completedAt as string,
      },
    });
  }

  async rollback(snapshot: ExecutionSnapshot): Promise<void> {
    const workflowState = snapshot.workflowState;
    workflowState.status = "rolled_back";
    workflowState.completedAt = new Date().toISOString();
  }

  canRollback(execution: unknown): boolean {
    const exec = execution as Record<string, unknown>;
    return exec.status === "failed" || exec.status === "completed";
  }
}
