import { describe, it, expect, vi } from "vitest";
import { RedisCache } from "@/core/cache/redis-cache";

describe("RedisCache", () => {
  it("should connect and disconnect", async () => {
    const mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      exists: vi.fn().mockResolvedValue(1),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };

    const cache = new RedisCache(mockClient as any);
    await cache.connect();
    expect(mockClient.connect).toHaveBeenCalled();
    await cache.disconnect();
    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("should get and set values", async () => {
    const mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue("\"test\""),
      set: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      exists: vi.fn().mockResolvedValue(1),
    };

    const cache = new RedisCache(mockClient as any);
    await cache.connect();
    await cache.set("a", "test");
    const value = await cache.get<string>("a");
    expect(value).toBe("test");
  });

  it("should delete a key", async () => {
    const mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(1),
      set: vi.fn().mockResolvedValue("OK"),
      get: vi.fn().mockResolvedValue(null),
      keys: vi.fn().mockResolvedValue([]),
      exists: vi.fn().mockResolvedValue(0),
    };

    const cache = new RedisCache(mockClient as any);
    await cache.delete("a");
    expect(mockClient.del).toHaveBeenCalledWith("a");
  });

  it("should report has correctly", async () => {
    const mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(1),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue("OK"),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
    };

    const cache = new RedisCache(mockClient as any);
    const hasKey = await cache.has("a");
    expect(hasKey).toBe(true);
  });
});