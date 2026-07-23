import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "@/core/logger/logger";
import type { AssetStorage, TemporaryAsset, PermanentAsset, AssetId } from "./asset.types";

export class LocalStorage implements AssetStorage {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? process.env.ASSET_STORAGE_DIR ?? "/tmp/tamer-assets";
  }

  private getKeyPath(key: string): string {
    return path.join(this.baseDir, key.replace(/^\//, ""));
  }

  async store(asset: TemporaryAsset | PermanentAsset, data: Buffer): Promise<string> {
    const key = this.buildAssetKey(asset.id);
    const filePath = this.getKeyPath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return key;
  }

  async retrieve(key: string): Promise<Buffer | null> {
    try {
      const filePath = this.getKeyPath(key);
      return await fs.readFile(filePath);
    } catch (error) {
      logger.error("Failed to retrieve asset", error as Error, { key });
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getKeyPath(key);
      await fs.unlink(filePath);
    } catch (error) {
      logger.error("Failed to delete asset", error as Error, { key });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = this.getKeyPath(key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    return `file://${this.getKeyPath(key)}`;
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      const searchPath = this.getKeyPath(prefix ?? "");
      const entries = await fs.readdir(searchPath, { recursive: true });
      return entries.map((entry) => entry as string);
    } catch {
      return [];
    }
  }

  private buildAssetKey(id: AssetId): string {
    return path.join(id.slice(0, 2), id);
  }
}