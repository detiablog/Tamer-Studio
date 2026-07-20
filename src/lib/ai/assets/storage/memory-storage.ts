import type { AssetStorage } from "./asset-storage";
import type { StorageReference } from "../types";

export class InMemoryAssetStorage implements AssetStorage {
  private storeMap: Map<string, Buffer> = new Map();

  async store(assetId: string, data: Buffer, _kind: string, _version: string): Promise<StorageReference> {
    const path = `memory://${assetId}`;
    this.storeMap.set(path, data);
    return { provider: "memory", path };
  }

  async get(storageRef: { path: string }): Promise<Buffer | undefined> {
    return this.storeMap.get(storageRef.path);
  }

  async delete(storageRef: { path: string }): Promise<void> {
    this.storeMap.delete(storageRef.path);
  }

  async exists(storageRef: { path: string }): Promise<boolean> {
    return this.storeMap.has(storageRef.path);
  }

  async getUrl(storageRef: { path: string; url?: string }): Promise<string | undefined> {
    return storageRef.url;
  }
}
