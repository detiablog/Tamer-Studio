import type { WorkflowDefinition, WorkflowId } from "../types";

export interface WorkflowRegistry {
  register(definition: WorkflowDefinition): void;
  registerMany(definitions: WorkflowDefinition[]): void;
  resolve(workflowId: WorkflowId): WorkflowDefinition | undefined;
  has(workflowId: WorkflowId): boolean;
  list(): WorkflowDefinition[];
  delete(workflowId: WorkflowId): void;
}

export class InMemoryWorkflowRegistry implements WorkflowRegistry {
  private workflows: Map<WorkflowId, WorkflowDefinition> = new Map();

  register(definition: WorkflowDefinition): void {
    if (this.workflows.has(definition.id)) {
      throw new Error(`Workflow ${definition.id} is already registered`);
    }
    this.workflows.set(definition.id, definition);
  }

  registerMany(definitions: WorkflowDefinition[]): void {
    for (const definition of definitions) {
      this.register(definition);
    }
  }

  resolve(workflowId: WorkflowId): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  has(workflowId: WorkflowId): boolean {
    return this.workflows.has(workflowId);
  }

  list(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  delete(workflowId: WorkflowId): void {
    this.workflows.delete(workflowId);
  }
}
