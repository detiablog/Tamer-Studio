import type { WorkflowNodeHandler, WorkflowNodeDefinition } from "../types";

export interface WorkflowNodeHandlerFactory {
  create(definition: WorkflowNodeDefinition): WorkflowNodeHandler;
}
