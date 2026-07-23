export type WorkflowId = string;
export type StepId = string;
export type ExecutionId = string;
export type WorkflowStatus = "draft" | "queued" | "running" | "paused" | "waiting_approval" | "completed" | "failed" | "cancelled";
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "waiting_approval";

export interface WorkflowStep {
  id: StepId;
  name: string;
  handler: string;
  config: Record<string, unknown>;
  dependsOn: StepId[];
  timeoutMs?: number;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export interface WorkflowContext {
  variables: Record<string, unknown>;
  artifacts: Map<string, unknown>;
}

export interface WorkflowVariables {
  static: Record<string, unknown>;
  dynamic: Map<string, unknown>;
  resolve(key: string): unknown;
  set(key: string, value: unknown): void;
}

export interface WorkflowResult {
  executionId: ExecutionId;
  workflowId: WorkflowId;
  status: WorkflowStatus;
  steps: Map<StepId, StepResult>;
  context: WorkflowContext;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface StepResult {
  stepId: StepId;
  status: StepStatus;
  output?: Record<string, unknown>;
  error?: string;
  durationMs: number;
  startedAt: string;
  completedAt: string;
}

export interface WorkflowHistory {
  executionId: ExecutionId;
  workflowId: WorkflowId;
  steps: StepHistoryEntry[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StepHistoryEntry {
  stepId: StepId;
  status: StepStatus;
  durationMs: number;
  error?: string;
  startedAt: string;
  completedAt: string;
}

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  variables: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidatorResult {
  valid: boolean;
  errors: string[];
}

export interface WorkflowValidator {
  validate(definition: WorkflowDefinition): ValidatorResult;
}