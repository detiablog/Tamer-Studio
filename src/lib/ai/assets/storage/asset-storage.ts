import type { AssetId, AssetKind, AssetVersion, StorageReference } from "../types";

export interface AssetStorage {
  store(assetId: AssetId, data: Buffer, kind: AssetKind, version: AssetVersion): Promise<StorageReference>;
  get(storageRef: StorageReference): Promise<Buffer | undefined>;
  delete(storageRef: StorageReference): Promise<void>;
  exists(storageRef: StorageReference): Promise<boolean>;
  getUrl(storageRef: StorageReference): Promise<string | undefined>;
}
