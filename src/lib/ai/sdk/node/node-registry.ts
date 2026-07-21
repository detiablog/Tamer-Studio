import type { WorkflowNodeDefinition, WorkflowNodeHandler, NodeCategory } from "../types";

export interface WorkflowNodeRegistry {
  register(handler: WorkflowNodeHandler): void;
  registerMany(handlers: WorkflowNodeHandler[]): void;
  resolve(type: string): WorkflowNodeDefinition | undefined;
  has(type: string): boolean;
  list(category?: NodeCategory): WorkflowNodeDefinition[];
  getHandler(type: string): WorkflowNodeHandler | undefined;
  unregister(type: string): void;
}

export class InMemoryWorkflowNodeRegistry implements WorkflowNodeRegistry {
  private handlers: Map<string, WorkflowNodeHandler> = new Map();
  private definitions: Map<string, WorkflowNodeDefinition> = new Map();

  register(handler: WorkflowNodeHandler): void {
    if (this.handlers.has(handler.definition.type)) {
      throw new Error(`Node type ${handler.definition.type} is already registered`);
    }
    this.handlers.set(handler.definition.type, handler);
    this.definitions.set(handler.definition.type, handler.definition);
  }

  registerMany(handlers: WorkflowNodeHandler[]): void {
    for (const handler of handlers) {
      this.register(handler);
    }
  }

  resolve(type: string): WorkflowNodeDefinition | undefined {
    return this.definitions.get(type);
  }

  has(type: string): boolean {
    return this.handlers.has(type);
  }

  list(category?: NodeCategory): WorkflowNodeDefinition[] {
    const all = Array.from(this.definitions.values());
    if (!category) return all;
    return all.filter((def) => def.category === category);
  }

  getHandler(type: string): WorkflowNodeHandler | undefined {
    return this.handlers.get(type);
  }

  unregister(type: string): void {
    this.handlers.delete(type);
    this.definitions.delete(type);
  }
}
