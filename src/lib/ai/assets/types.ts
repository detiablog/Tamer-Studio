export type AssetId = string;
export type AssetVersion = string;
export type AssetStatus = "draft" | "processing" | "ready" | "archived" | "deleted" | "failed";

export type AssetKind =
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "subtitle"
  | "prompt"
  | "storyboard"
  | "script"
  | "caption"
  | "translation"
  | "workflow"
  | "document"
  | "template";

export type AssetRelationshipType =
  | "derived_from"
  | "modified_from"
  | "referenced_by"
  | "part_of"
  | "merged_from"
  | "split_from"
  | "inspired_by";

export type AssetLifecycleTransition =
  | "create"
  | "process"
  | "complete"
  | "archive"
  | "delete"
  | "fail"
  | "restore"
  | "publish";

export type CollectionVisibility = "private" | "workspace" | "public";

export interface AssetMetadata {
  title?: string;
  description?: string;
  tags: string[];
  mimeType?: string;
  sizeBytes?: number;
  dimensions?: { width: number; height: number };
  durationMs?: number;
  format?: string;
  encoding?: string;
  language?: string;
  pages?: number;
  custom: Record<string, unknown>;
}

export interface AssetSource {
  executionId?: string;
  workflowId?: string;
  gatewayId?: string;
  promptId?: string;
  capabilityId?: string;
}

export interface StorageReference {
  provider: "memory" | "local" | "s3" | "gcs" | "azure";
  path: string;
  url?: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

export interface AssetPreview {
  thumbnailUrl?: string;
  previewUrl?: string;
  embedUrl?: string;
  width?: number;
  height?: number;
  durationMs?: number;
  format?: string;
}

export interface AssetVersionInfo {
  version: string;
  changelog?: string;
  metadata: AssetMetadata;
  storageRef: StorageReference;
  createdBy: string;
  createdAt: string;
}

export interface AssetLineageEntry {
  id: string;
  assetId: string;
  parentId: string;
  relationship: AssetRelationshipType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  visibility: CollectionVisibility;
  assetIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetGraphNode {
  assetId: string;
  kind: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface AssetGraphEdge {
  from: string;
  to: string;
  relationship: string;
  metadata?: Record<string, unknown>;
}

export interface AssetGraph {
  nodes: AssetGraphNode[];
  edges: AssetGraphEdge[];
}

export interface AssetSearchQuery {
  query?: string;
  kind?: string;
  status?: string;
  tags?: string[];
  createdBy?: string;
  sourceExecutionId?: string;
  sourceWorkflowId?: string;
  sourceGatewayId?: string;
  sourcePromptId?: string;
  limit?: number;
  offset?: number;
}

export interface AssetSearchResult {
  assetId: string;
  kind: string;
  status: string;
  metadata: Record<string, unknown>;
  score?: number;
}

export interface AssetLifecycleEvent {
  assetId: string;
  from: string;
  to: string;
  trigger: AssetLifecycleTransition;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface NormalizedAsset {
  assetId: string;
  kind: string;
  data: unknown;
  metadata: Partial<AssetMetadata>;
  preview?: Partial<AssetPreview>;
}

export interface AssetPipelineContext {
  executionId: string;
  capabilityId: string;
  workflowId?: string;
  gatewayId?: string;
  promptId?: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
}

export interface Asset {
  assetId: string;
  kind: AssetKind;
  status: AssetStatus;
  metadata: AssetMetadata;
  source: AssetSource;
  storageRef: StorageReference;
  currentVersion: string;
  preview: AssetPreview;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = AssetKind;

export interface AssetReference {
  assetId: string;
  type: AssetType;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface AssetRecord {
  assetId: string;
  type: AssetType;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  metadata?: Record<string, unknown>;
  executionId: string;
  createdAt: string;
  updatedAt: string;
}
