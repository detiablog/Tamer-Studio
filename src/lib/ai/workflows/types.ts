export type WorkflowId = string;
export type NodeId = string;
export type ExecutionId = string;

export type WorkflowStatus = "draft" | "queued" | "running" | "paused" | "waiting_approval" | "completed" | "failed" | "cancelled";

export type NodeType =
  | "prompt"
  | "image_generation"
  | "video_generation"
  | "caption"
  | "translation"
  | "approval"
  | "publish"
  | "export"
  | "custom";

export type NodeStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "waiting_approval";

export interface WorkflowNode {
  id: NodeId;
  type: NodeType;
  name: string;
  config: Record<string, unknown>;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  dependsOn: NodeId[];
  retryPolicy?: RetryPolicy;
  timeoutMs?: number;
}

export interface NodeInput {
  name: string;
  type: string;
  required: boolean;
  source?: NodeId | "workflow";
}

export interface NodeOutput {
  name: string;
  type: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

export interface WorkflowEdge {
  from: NodeId;
  to: NodeId;
  condition?: string;
}

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  executionId: ExecutionId;
  workflowId: WorkflowId;
  status: WorkflowStatus;
  currentNodeId?: NodeId;
  context: Record<string, unknown>;
  results: Map<NodeId, NodeResult>;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface NodeResult {
  nodeId: NodeId;
  status: NodeStatus;
  output?: Record<string, unknown>;
  assets: string[];
  error?: string;
  durationMs: number;
  startedAt: string;
  completedAt: string;
}

export interface WorkflowHistoryEntry {
  executionId: ExecutionId;
  workflowId: WorkflowId;
  version: string;
  status: WorkflowStatus;
  steps: WorkflowStepHistory[];
  assets: string[];
  creditsUsed: number;
  gatewayUsage: Record<string, number>;
  executionTimeMs: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStepHistory {
  nodeId: NodeId;
  status: NodeStatus;
  durationMs: number;
  error?: string;
  startedAt: string;
  completedAt: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: WorkflowDefinition;
  tags: string[];
}
