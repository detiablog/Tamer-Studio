import type { WorkflowNodeHandler, NodeExecutionContext, NodeExecutionResult, ValidationResult, WorkflowNodeDefinition } from "../types";

export interface WorkflowNodeHandlerFactory {
  create(definition: WorkflowNodeDefinition): WorkflowNodeHandler;
}
