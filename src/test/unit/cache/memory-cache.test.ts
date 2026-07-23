import { describe, it, expect } from "vitest";
import { InMemoryCache } from "@/core/cache/memory-cache";

describe("InMemoryCache", () => {
  it("should set and get a value", async () => {
    const cache = new InMemoryCache();
    await cache.set("a", 1);
    expect(await cache.get<number>("a")).toBe(1);
  });

  it("should return undefined for missing keys", async () => {
    const cache = new InMemoryCache();
    expect(await cache.get("missing")).toBeUndefined();
  });

  it("should delete a key", async () => {
    const cache = new InMemoryCache();
    await cache.set("a", 1);
    await cache.delete("a");
    expect(await cache.get("a")).toBeUndefined();
  });

  it("should clear all entries", async () => {
    const cache = new InMemoryCache();
    await cache.set("a", 1);
    await cache.set("b", 2);
    await cache.clear();
    expect(await cache.get("a")).toBeUndefined();
    expect(await cache.get("b")).toBeUndefined();
  });

  it("should return stats", async () => {
    const cache = new InMemoryCache();
    await cache.set("a", 1);
    await cache.get("a");
    await cache.get("missing");
    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it("should report has correctly", async () => {
    const cache = new InMemoryCache();
    await cache.set("a", 1);
    expect(await cache.has("a")).toBe(true);
    expect(await cache.has("missing")).toBe(false);
  });

  it("should invalidate by tag", async () => {
    const cache = new InMemoryCache();
    await cache.set("a", 1, undefined, ["group1"]);
    await cache.set("b", 2, undefined, ["group1"]);
    await cache.invalidateByTag("group1");
    expect(await cache.get("a")).toBeUndefined();
    expect(await cache.get("b")).toBeUndefined();
  });
});