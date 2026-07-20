import type { CapabilityId } from "./capability";
import type { WorkflowId } from "./workflow";
import type { GatewayId } from "./gateway";

export type ExecutionId = string;

export type ExecutionStatus =
  | "pending"
  | "validating"
  | "resolving"
  | "executing"
  | "normalizing"
  | "storing"
  | "completed"
  | "failed"
  | "cancelled";

export interface ExecutionContext {
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  requestId?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionRequest {
  executionId?: ExecutionId;
  capabilityId: CapabilityId;
  workflowId?: WorkflowId;
  gatewayId?: GatewayId;
  payload: Record<string, unknown>;
  context: ExecutionContext;
  priority?: "low" | "normal" | "high";
}

export type AssetReference = {
  assetId: string;
  type: "image" | "video" | "audio" | "document" | "text" | "binary";
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  metadata?: Record<string, unknown>;
};

export type UsageRecord = {
  requests: number;
  tokens?: number;
  characters?: number;
  images?: number;
  videoSeconds?: number;
  audioSeconds?: number;
  estimatedCost: number;
  currency: string;
  providerDistribution?: Record<string, number>;
};

export interface ExecutionResponse {
  executionId: ExecutionId;
  status: ExecutionStatus;
  result?: Record<string, unknown>;
  assets: AssetReference[];
  usage: UsageRecord;
  durationMs: number;
  costEstimate?: number;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ExecutionHistoryEntry {
  executionId: ExecutionId;
  status: ExecutionStatus;
  capabilityId: CapabilityId;
  workflowId?: WorkflowId;
  gatewayId?: GatewayId;
  durationMs: number;
  usage: UsageRecord;
  costEstimate?: number;
  assets: AssetReference[];
  error?: {
    code: string;
    message: string;
  };
  createdAt: string;
  updatedAt: string;
}
