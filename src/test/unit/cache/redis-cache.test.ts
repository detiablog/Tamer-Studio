import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/redis", () => {
  return {
    Redis: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      exists: vi.fn().mockResolvedValue(0),
      smembers: vi.fn().mockResolvedValue([]),
      srem: vi.fn().mockResolvedValue(1),
      pipeline: vi.fn().mockReturnValue({
        sadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        del: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      }),
    })),
  };
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
