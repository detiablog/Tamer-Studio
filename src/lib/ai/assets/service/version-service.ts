import type { Asset, AssetId, AssetVersion, AssetVersionInfo, StorageReference } from "../types";

export interface VersionService {
  createVersion(assetId: AssetId, input: {
    version: AssetVersion;
    changelog?: string;
    metadata: Asset["metadata"];
    storageRef: StorageReference;
    createdBy: string;
  }): Promise<AssetVersionInfo>;
  getVersion(assetId: AssetId, version: AssetVersion): Promise<AssetVersionInfo | undefined>;
  listVersions(assetId: AssetId): Promise<AssetVersionInfo[]>;
  rollbackToVersion(assetId: AssetId, version: AssetVersion): Promise<Asset | undefined>;
}

export class InMemoryVersionService implements VersionService {
  private versions: Map<string, AssetVersionInfo[]> = new Map();

  private key(assetId: AssetId): string {
    return `versions:${assetId}`;
  }

  async createVersion(assetId: AssetId, input: {
    version: AssetVersion;
    changelog?: string;
    metadata: Asset["metadata"];
    storageRef: StorageReference;
    createdBy: string;
  }): Promise<AssetVersionInfo> {
    const versionInfo: AssetVersionInfo = {
      version: input.version,
      changelog: input.changelog,
      metadata: input.metadata,
      storageRef: input.storageRef,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };

    const list = this.versions.get(this.key(assetId)) ?? [];
    list.push(versionInfo);
    this.versions.set(this.key(assetId), list);

    return versionInfo;
  }

  async getVersion(assetId: AssetId, version: AssetVersion): Promise<AssetVersionInfo | undefined> {
    return this.versions.get(this.key(assetId))?.find((v) => v.version === version);
  }

  async listVersions(assetId: AssetId): Promise<AssetVersionInfo[]> {
    return this.versions.get(this.key(assetId)) ?? [];
  }

  async rollbackToVersion(_assetId: AssetId, _version: AssetVersion): Promise<Asset | undefined> {
    return undefined;
  }
}
