export type AssetId = string;
export type AssetStatus = "draft" | "active" | "archived" | "deleted";
export type AssetKind = "image" | "video" | "audio" | "document" | "archive" | "custom";
export type AssetLifetime = "temporary" | "permanent";

export interface AssetVersion {
  version: string;
  changelog?: string;
  metadata: Record<string, unknown>;
}

export interface AssetMetadata {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
}

export interface TemporaryAsset {
  id: AssetId;
  kind: AssetKind;
  metadata: AssetMetadata;
  expiresAt: string;
  metadata_: Record<string, unknown>;
}

export interface PermanentAsset {
  id: AssetId;
  kind: AssetKind;
  metadata: AssetMetadata;
  versions: AssetVersion[];
  metadata_: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StorageProvider {
  readonly name: string;
  put(key: string, data: Buffer, contentType: string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  list(prefix?: string): Promise<string[]>;
}

export interface AssetStorage {
  store(asset: TemporaryAsset | PermanentAsset, data: Buffer): Promise<string>;
  retrieve(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  getUrl(key: string, expiresInSeconds?: number): Promise<string>;
  list(prefix?: string): Promise<string[]>;
}