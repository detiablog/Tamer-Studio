import type { WorkflowNode, NodeResult } from "../types";
import type { WorkflowNodeRegistry } from "../../sdk";
import { InMemoryWorkflowNodeRegistry } from "../../sdk/node/node-registry";

export interface NodeExecutor {
  execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult>;
}

export class DefaultNodeExecutor implements NodeExecutor {
  private registry: WorkflowNodeRegistry;

  constructor(registry?: WorkflowNodeRegistry) {
    this.registry = registry ?? new InMemoryWorkflowNodeRegistry();
  }

  setRegistry(registry: WorkflowNodeRegistry): void {
    this.registry = registry;
  }

  async execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    try {
      const handler = this.registry.getHandler(node.type);
      if (!handler) {
        throw new Error(`No handler registered for node type: ${node.type}`);
      }

      const workflowHandler = handler as unknown as { execute: (node: WorkflowNode, context: Record<string, unknown>) => Promise<NodeResult> };
      const result = await workflowHandler.execute(node, context);
      return {
        nodeId: node.id,
        status: result.status,
        output: result.output,
        assets: result.assets,
        error: result.error,
        durationMs: Date.now() - startTime,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        nodeId: node.id,
        status: "failed",
        output: {},
        assets: [],
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs: Date.now() - startTime,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }
  }
}
