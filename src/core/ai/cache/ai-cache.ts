import { logger } from "@/core/logger";

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  hitCount: number;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSizeBytes: number;
  memoryUsageBytes: number;
}

export interface AICacheConfig {
  enabled: boolean;
  defaultTtlMs: number;
  maxEntries: number;
  maxMemoryBytes: number;
  enablePromptCache: boolean;
  enableResponseCache: boolean;
  enableEmbeddingCache: boolean;
}

export interface AICache {
  get<T = unknown>(key: string): T | undefined;
  set<T = unknown>(key: string, data: T, ttlMs?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  getStats(): CacheStats;
  buildPromptKey(prompt: string, model: string, options?: Record<string, unknown>): string;
  buildResponseKey(prompt: string, model: string, capability: string): string;
  buildEmbeddingKey(text: string, model: string): string;
}

const DEFAULT_CONFIG: AICacheConfig = {
  enabled: true,
  defaultTtlMs: 5 * 60 * 1000,
  maxEntries: 1000,
  maxMemoryBytes: 50 * 1024 * 1024,
  enablePromptCache: true,
  enableResponseCache: true,
  enableEmbeddingCache: true,
};

export class DefaultAICache implements AICache {
  private store = new Map<string, CacheEntry>();
  private config: AICacheConfig;
  private totalHits = 0;
  private totalMisses = 0;

  constructor(config?: Partial<AICacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get<T = unknown>(key: string): T | undefined {
    if (!this.config.enabled) return undefined;

    const entry = this.store.get(key);
    if (!entry) {
      this.totalMisses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.totalMisses++;
      return undefined;
    }

    entry.hitCount++;
    this.totalHits++;
    return entry.data as T;
  }

  set<T = unknown>(key: string, data: T, ttlMs?: number): void {
    if (!this.config.enabled) return;

    if (this.store.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    const effectiveTtl = ttlMs ?? this.config.defaultTtlMs;
    const size = this.estimateSize(data);

    const entry: CacheEntry<T> = {
      key,
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + effectiveTtl,
      hitCount: 0,
      size,
    };

    this.store.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }

  getStats(): CacheStats {
    const entries = Array.from(this.store.values());
    let totalSizeBytes = 0;
    for (const entry of entries) {
      totalSizeBytes += entry.size;
    }

    const totalRequests = this.totalHits + this.totalMisses;
    return {
      totalEntries: entries.length,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      hitRate: totalRequests > 0 ? this.totalHits / totalRequests : 0,
      totalSizeBytes,
      memoryUsageBytes: totalSizeBytes,
    };
  }

  buildPromptKey(prompt: string, model: string, options?: Record<string, unknown>): string {
    const parts = [`prompt:${model}`, this.hashString(prompt)];
    if (options) {
      const sorted = Object.keys(options)
        .sort()
        .map((k) => `${k}=${JSON.stringify(options[k])}`)
        .join("&");
      parts.push(this.hashString(sorted));
    }
    return parts.join(":");
  }

  buildResponseKey(prompt: string, model: string, capability: string): string {
    return `response:${capability}:${model}:${this.hashString(prompt)}`;
  }

  buildEmbeddingKey(text: string, model: string): string {
    return `embedding:${model}:${this.hashString(text)}`;
  }

  private evictOldest(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      logger.debug("Cache eviction", { key: oldestKey });
    }
  }

  private estimateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length * 2;
    } catch {
      return 1024;
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
}

export function createAICache(config?: Partial<AICacheConfig>): AICache {
  return new DefaultAICache(config);
}
