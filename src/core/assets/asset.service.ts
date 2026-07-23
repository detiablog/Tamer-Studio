import { logger as _logger } from "@/core/logger/logger";
import type { AssetStorage, TemporaryAsset, PermanentAsset, AssetId, AssetKind, AssetMetadata, AssetLifetime } from "./asset.types";

export interface StoreAssetInput {
  id: AssetId;
  kind: AssetKind;
  data: Buffer;
  metadata: AssetMetadata;
  lifetime: AssetLifetime;
  metadata_?: Record<string, unknown>;
  status?: string;
}

export interface PromoteAssetInput {
  id: AssetId;
  versions: { version: string; changelog?: string; metadata: Record<string, unknown> }[];
  metadata_?: Record<string, unknown>;
  status?: string;
}

export class AssetService {
  constructor(private storage: AssetStorage) {}

  async store(input: StoreAssetInput): Promise<TemporaryAsset> {
    const asset = this.buildTemporaryAsset(input);
    await this.storage.store(asset, input.data);
    return asset;
  }

  async promoteToPermanent(input: PromoteAssetInput): Promise<PermanentAsset> {
    const key = this.buildKey(input.id);
    const existing = await this.storage.retrieve(key);
    if (!existing) throw new Error("Asset not found");

    const metadata = JSON.parse(existing.toString("utf-8")) as TemporaryAsset | PermanentAsset;
    const now = new Date().toISOString();
    const permanent: PermanentAsset = {
      id: input.id,
      kind: metadata.kind,
      metadata: metadata.metadata,
      versions: input.versions,
      metadata_: input.metadata_ ?? {},
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.store(permanent, existing);
    return permanent;
  }

  async retrieve(id: AssetId): Promise<Buffer | null> {
    return this.storage.retrieve(this.buildKey(id));
  }

  async delete(id: AssetId): Promise<void> {
    await this.storage.delete(this.buildKey(id));
  }

  async getDownloadUrl(id: AssetId, expiresInSeconds?: number): Promise<string> {
    return this.storage.getUrl(this.buildKey(id), expiresInSeconds);
  }

  private buildTemporaryAsset(input: StoreAssetInput): TemporaryAsset {
    const now = new Date();
    const expiresAt = input.lifetime === "temporary"
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : new Date(2099, 11, 31).toISOString();

    return {
      id: input.id,
      kind: input.kind,
      metadata: input.metadata,
      expiresAt,
      metadata_: input.metadata_ ?? {},
    };
  }

  private buildKey(id: AssetId): string {
    return `${id.slice(0, 2)}/${id}`;
  }
}