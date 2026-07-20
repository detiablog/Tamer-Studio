export type WorkflowId = string;

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  capabilityIds: string[];
  steps: WorkflowStep[];
  estimatedDuration?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  capabilityId: string;
  dependsOn?: string[];
}
