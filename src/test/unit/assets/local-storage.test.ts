import { describe, it, expect } from "vitest";
import { LocalStorage } from "@/core/assets/local-storage";

describe("LocalStorage", () => {
  it("should store and retrieve an asset", async () => {
    const storage = new LocalStorage("/tmp/tamer-assets-test");
    const key = await storage.store({
      id: "abc123",
      kind: "image",
      metadata: { filename: "test.png", mimeType: "image/png", sizeBytes: 100 },
      expiresAt: new Date().toISOString(),
      metadata_: {},
    }, Buffer.from("fake-image-data"));

    expect(key).toBeDefined();
    const data = await storage.retrieve(key);
    expect(data).toEqual(Buffer.from("fake-image-data"));
  });

  it("should return null for missing keys", async () => {
    const storage = new LocalStorage("/tmp/tamer-assets-test-nonexistent");
    const data = await storage.retrieve("nonexistent");
    expect(data).toBeNull();
  });

  it("should delete an asset", async () => {
    const storage = new LocalStorage("/tmp/tamer-assets-test-delete");
    const key = await storage.store({
      id: "del123",
      kind: "document",
      metadata: { filename: "doc.pdf", mimeType: "application/pdf", sizeBytes: 200 },
      expiresAt: new Date().toISOString(),
      metadata_: {},
    }, Buffer.from("pdf-data"));

    await storage.delete(key);
    const data = await storage.retrieve(key);
    expect(data).toBeNull();
  });

  it("should list assets with prefix", async () => {
    const storage = new LocalStorage("/tmp/tamer-assets-test-list");
    await storage.store({
      id: "list1",
      kind: "image",
      metadata: { filename: "a.png", mimeType: "image/png", sizeBytes: 100 },
      expiresAt: new Date().toISOString(),
      metadata_: {},
    }, Buffer.from("a"));

    const results = await storage.list("li");
    expect(results.length).toBeGreaterThan(0);
  });
});