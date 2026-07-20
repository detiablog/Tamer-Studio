import type { ExecutionId } from "./execution";

export type AssetId = string;
export type AssetType = "image" | "video" | "audio" | "document" | "text" | "binary";

export interface AssetReference {
  assetId: AssetId;
  type: AssetType;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface AssetRecord {
  assetId: AssetId;
  type: AssetType;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  metadata?: Record<string, unknown>;
  executionId: ExecutionId;
  createdAt: string;
  updatedAt: string;
}
