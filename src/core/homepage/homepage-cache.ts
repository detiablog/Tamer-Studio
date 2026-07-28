import type { HomepageResolutionResult } from "./homepage.types";
import type { SharedCache } from "@/core/cache/cache.interface";
import { getSharedCache } from "@/core/cache/shared-cache";

const PREFIX = "homepage:";

export class HomepageCache {
  private shared: SharedCache;

  constructor(sharedCache?: SharedCache) {
    this.shared = sharedCache ?? getSharedCache();
  }

  async get(key: string): Promise<HomepageResolutionResult | null> {
    const result = await this.shared.get<HomepageResolutionResult>(key);
    return result ?? null;
  }

  async set(key: string, data: HomepageResolutionResult, tags?: string[] | { tags?: string[] }): Promise<void> {
    const resolvedTags = Array.isArray(tags) ? tags : tags?.tags ?? [];
    await this.shared.set(key, data, { tags: resolvedTags });
  }

  async has(key: string): Promise<boolean> {
    return this.shared.has(key);
  }

  async invalidate(key: string): Promise<boolean> {
    const exists = await this.shared.has(key);
    if (exists) {
      await this.shared.delete(key);
      return true;
    }
    return false;
  }

  async invalidateByTag(tag: string): Promise<number> {
    await this.shared.invalidateByTag(tag);
    return 0;
  }

  async invalidateAll(): Promise<void> {
    await this.shared.invalidateAll();
  }

  buildKey(locale: string, device: string, isPreview: boolean, previewMode?: string): string {
    const parts = [`homepage`, locale, device];
    if (isPreview) parts.push(`preview`, previewMode ?? "draft");
    return parts.join(":");
  }

  async getSize(): Promise<number> {
    return this.shared.getStats().size;
  }

  getStats() {
    return this.shared.getStats();
  }
}

let cacheInstance: HomepageCache | null = null;

export function getHomepageCache(): HomepageCache {
  if (!cacheInstance) {
    cacheInstance = new HomepageCache();
  }
  return cacheInstance;
}

export function resetHomepageCache(): void {
  cacheInstance = null;
}
