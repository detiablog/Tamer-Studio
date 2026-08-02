import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/redis", () => {
  const MockRedis = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    const store = new Map<string, unknown>();
    const tagStore = new Map<string, Set<string>>();
    this.get = vi.fn().mockImplementation((key: string) => Promise.resolve(store.get(key) ?? null));
    this.set = vi.fn().mockImplementation((key: string, value: unknown) => { store.set(key, value); return Promise.resolve("OK"); });
    this.del = vi.fn().mockImplementation((...keys: string[]) => { keys.forEach(k => store.delete(k)); return Promise.resolve(1); });
    this.keys = vi.fn().mockImplementation((pattern: string) => {
      const prefix = pattern.replace("*", "");
      return Promise.resolve([...store.keys()].filter(k => k.startsWith(prefix)));
    });
    this.exists = vi.fn().mockImplementation((key: string) => Promise.resolve(store.has(key) ? 1 : 0));
    this.smembers = vi.fn().mockImplementation((key: string) => Promise.resolve([...(tagStore.get(key) ?? [])]));
    this.srem = vi.fn().mockImplementation((key: string, value: string) => {
      const s = tagStore.get(key);
      if (s) s.delete(value);
      return Promise.resolve(1);
    });
    this.pipeline = vi.fn().mockReturnValue({
      sadd: vi.fn().mockImplementation((key: string, value: string) => {
        if (!tagStore.has(key)) tagStore.set(key, new Set());
        tagStore.get(key)!.add(value);
        return { sadd: vi.fn().mockReturnThis(), expire: vi.fn().mockReturnThis(), del: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue([]) };
      }),
      expire: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    });
  });
  return { Redis: MockRedis };
});

import { RedisCache } from "@/core/cache/redis-cache";

describe("RedisCache", () => {
  let cache: RedisCache;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new RedisCache({ defaultTtl: 60000 });
  });

  it("should get and set values", async () => {
    await cache.set("a", "test");
    const value = await cache.get<string>("a");
    expect(value).toBe("test");
  });

  it("should delete a key", async () => {
    await cache.delete("a");
  });

  it("should report has correctly", async () => {
    const hasKey = await cache.has("a");
    expect(hasKey).toBe(false);
  });

  it("should return stats", () => {
    const stats = cache.getStats();
    expect(stats).toHaveProperty("hits");
    expect(stats).toHaveProperty("misses");
    expect(stats).toHaveProperty("evictions");
  });

  it("should invalidate by tag", async () => {
    await cache.invalidateByTag("group1");
  });

  it("should invalidate all", async () => {
    await cache.invalidateAll();
  });

  it("should clear", async () => {
    await cache.clear();
  });
});
