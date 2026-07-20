import type { NodeExecutor, NodeExecutionContext, NodeExecutionResult, WorkflowNodeDefinition } from "../types";
import type { WorkflowNodeRegistry } from "./node-registry";

export class DefaultNodeExecutor implements NodeExecutor {
  constructor(private registry: WorkflowNodeRegistry) {}

  async execute(definition: WorkflowNodeDefinition, input: NodeExecutionContext): Promise<NodeExecutionResult> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    try {
      const handler = this.registry.getHandler(definition.type);
      if (!handler) {
        throw new Error(`No handler registered for node type: ${definition.type}`);
      }

      const validation = await handler.validate(input);
      if (!validation.valid) {
        const errorMessages = validation.errors.map((e) => e.message).join("; ");
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      const result = await handler.execute(input);
      return {
        ...result,
        startedAt,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        nodeId: definition.id,
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
