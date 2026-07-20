import type { AssetId, AssetRecord } from "./types";
import type { ExecutionId } from "../types/execution";

export interface AssetManager {
  store(record: Omit<AssetRecord, "createdAt" | "updatedAt">): Promise<AssetRecord>;
  get(assetId: AssetId): Promise<AssetRecord | undefined>;
  listByExecution(executionId: ExecutionId): Promise<AssetRecord[]>;
  delete(assetId: AssetId): Promise<void>;
}

export class InMemoryAssetManager implements AssetManager {
  private assets: Map<AssetId, AssetRecord> = new Map();

  async store(record: Omit<AssetRecord, "createdAt" | "updatedAt">): Promise<AssetRecord> {
    const now = new Date().toISOString();
    const asset: AssetRecord = {
      ...record,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.set(asset.assetId, asset);
    return asset;
  }

  async get(assetId: AssetId): Promise<AssetRecord | undefined> {
    return this.assets.get(assetId);
  }

  async listByExecution(executionId: ExecutionId): Promise<AssetRecord[]> {
    return Array.from(this.assets.values()).filter((asset) => asset.executionId === executionId);
  }

  async delete(assetId: AssetId): Promise<void> {
    this.assets.delete(assetId);
  }
}
