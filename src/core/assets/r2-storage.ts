import { logger as _logger } from "@/core/logger/logger";
import type { AssetStorage, TemporaryAsset, PermanentAsset, AssetId } from "./asset.types";

export interface R2Bucket {
  put(key: string, data: Buffer, options?: { contentType?: string }): Promise<{ key: string }>;
  get(key: string): Promise<{ body: ReadableStream<Uint8Array> } | null>;
  delete(key: string): Promise<void>;
  head(key: string): Promise<{ headers: { "content-type"?: string } } | null>;
  list(prefix?: { prefix: string }): Promise<{ objects: { key: string }[] }>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
}

export class R2Storage implements AssetStorage {
  readonly name = "r2";

  constructor(private bucket: R2Bucket) {}

  async store(asset: TemporaryAsset | PermanentAsset, data: Buffer): Promise<string> {
    const key = this.buildAssetKey(asset.id);
    await this.bucket.put(key, data, { contentType: asset.metadata.mimeType });
    return key;
  }

  async retrieve(key: string): Promise<Buffer | null> {
    const result = await this.bucket.get(key);
    if (!result) return null;
    const chunks: Uint8Array[] = [];
    const reader = result.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.bucket.head(key);
    return result !== null;
  }

  async getUrl(key: string, expiresInSeconds?: number): Promise<string> {
    return this.bucket.getSignedUrl(key, expiresInSeconds ?? 3600);
  }

  async list(prefix?: string): Promise<string[]> {
    const result = await this.bucket.list(prefix ? { prefix } : undefined);
    return result.objects.map((o) => o.key);
  }

  private buildAssetKey(id: AssetId): string {
    return `${id.slice(0, 2)}/${id}`;
  }
}