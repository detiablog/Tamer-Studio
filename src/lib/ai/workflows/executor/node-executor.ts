import type { WorkflowNode, NodeResult } from "../types";

export interface NodeExecutor {
  execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult>;
}

export class DefaultNodeExecutor implements NodeExecutor {
  async execute(node: WorkflowNode, context: Record<string, unknown>): Promise<NodeResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    try {
      const output = await this.runNode(node, context);
      const completedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;

      return {
        nodeId: node.id,
        status: "completed",
        output,
        assets: [],
        durationMs,
        startedAt,
        completedAt,
      };
    } catch (error) {
      const completedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;

      return {
        nodeId: node.id,
        status: "failed",
        assets: [],
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs,
        startedAt,
        completedAt,
      };
    }
  }

  private async runNode(_node: WorkflowNode, _context: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { status: "placeholder", message: "Node execution pending provider integration" };
  }
}
