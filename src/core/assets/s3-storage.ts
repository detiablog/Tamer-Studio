import { logger as _logger } from "@/core/logger/logger";
import type { AssetStorage, TemporaryAsset, PermanentAsset, AssetId } from "./asset.types";

export interface S3StorageOptions {
  bucket: string;
}

export class S3Storage implements AssetStorage {
  readonly name = "s3";

  constructor(private client: any, private options: S3StorageOptions) {}

  async store(asset: TemporaryAsset | PermanentAsset, data: Buffer): Promise<string> {
    const key = this.buildAssetKey(asset.id);
    await this.client.send("PutObjectCommand", {
      Bucket: this.options.bucket,
      Key: key,
      Body: data,
      ContentType: asset.metadata.mimeType,
    });
    return key;
  }

  async retrieve(key: string): Promise<Buffer | null> {
    const result = await this.client.send("GetObjectCommand", {
      Bucket: this.options.bucket,
      Key: key,
    });
    const body = result?.Body;
    if (!body) return null;
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    await this.client.send("DeleteObjectCommand", {
      Bucket: this.options.bucket,
      Key: key,
    });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send("HeadObjectCommand", {
        Bucket: this.options.bucket,
        Key: key,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    const result = await this.client.send("GetObjectCommand", {
      Bucket: this.options.bucket,
      Key: key,
    });
    const url = result?.url;
    if (url) return url;
    throw new Error("getSignedUrl not supported");
  }

  async list(prefix?: string): Promise<string[]> {
    const result = await this.client.send("ListObjectsV2Command", {
      Bucket: this.options.bucket,
      Prefix: prefix,
    });
    return result?.Contents?.map((o: { Key: string }) => o.Key).filter(Boolean) ?? [];
  }

  private buildAssetKey(id: AssetId): string {
    return `${id.slice(0, 2)}/${id}`;
  }
}