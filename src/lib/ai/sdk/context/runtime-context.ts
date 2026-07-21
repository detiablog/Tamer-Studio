import type { NodeExecutionContext, WorkflowNodeDefinition, NodeExecutionResult, ValidationResult } from "../types";

export function createNodeExecutionContext(
  node: WorkflowNodeDefinition,
  context: unknown,
  inputs: Record<string, unknown> = {},
  memory: unknown = null,
  signal?: AbortSignal,
): NodeExecutionContext {
  return {
    node,
    context: context as NodeExecutionContext["context"],
    inputs,
    memory: memory as NodeExecutionContext["memory"],
    signal,
  };
}
