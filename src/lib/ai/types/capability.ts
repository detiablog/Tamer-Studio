export type CapabilityId = string;

export type CapabilityCategory =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "speech"
  | "vision"
  | "embedding"
  | "automation"
  | "custom";

export interface CapabilityDefinition {
  id: CapabilityId;
  name: string;
  category: CapabilityCategory;
  description: string;
  inputSchema: { [key: string]: unknown };
  outputSchema: { [key: string]: unknown };
  tags: string[];
}

export type WorkflowId = string;

export interface WorkflowDefinition {
  id: WorkflowId;
  name: string;
  description: string;
  capabilityIds: CapabilityId[];
  steps: WorkflowStep[];
  estimatedDuration?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  capabilityId: CapabilityId;
  dependsOn?: string[];
}

export type GatewayId = string;

export interface GatewayDefinition {
  id: GatewayId;
  name: string;
  description: string;
  supportedCapabilities: CapabilityId[];
  status: "active" | "inactive" | "error";
}
