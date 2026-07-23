import type { WorkflowHistory } from "./workflow.types";

export interface WorkflowHistoryRepository {
  save(history: WorkflowHistory): Promise<void>;
  findById(executionId: string): Promise<WorkflowHistory | undefined>;
  findByWorkflowId(workflowId: string): Promise<WorkflowHistory[]>;
  delete(executionId: string): Promise<void>;
}

export class InMemoryWorkflowHistory implements WorkflowHistoryRepository {
  private store: Map<string, WorkflowHistory> = new Map();

  async save(history: WorkflowHistory): Promise<void> {
    this.store.set(history.executionId, history);
  }

  async findById(executionId: string): Promise<WorkflowHistory | undefined> {
    return this.store.get(executionId);
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowHistory[]> {
    return Array.from(this.store.values()).filter((h) => h.workflowId === workflowId);
  }

  async delete(executionId: string): Promise<void> {
    this.store.delete(executionId);
  }
}