import type { WorkflowHistoryEntry, ExecutionId } from "../types";

export interface WorkflowHistory {
  record(entry: Omit<WorkflowHistoryEntry, "createdAt" | "updatedAt">): Promise<void>;
  getHistory(executionId: ExecutionId): Promise<WorkflowHistoryEntry | undefined>;
  listHistory(): Promise<WorkflowHistoryEntry[]>;
}

export class InMemoryWorkflowHistory implements WorkflowHistory {
  private history: Map<ExecutionId, WorkflowHistoryEntry> = new Map();

  async record(entry: Omit<WorkflowHistoryEntry, "createdAt" | "updatedAt">): Promise<void> {
    const now = new Date().toISOString();
    const record: WorkflowHistoryEntry = {
      ...entry,
      createdAt: now,
      updatedAt: now,
    };
    this.history.set(entry.executionId, record);
  }

  async getHistory(executionId: ExecutionId): Promise<WorkflowHistoryEntry | undefined> {
    return this.history.get(executionId);
  }

  async listHistory(): Promise<WorkflowHistoryEntry[]> {
    return Array.from(this.history.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
