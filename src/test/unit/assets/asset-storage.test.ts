import { describe, it, expect } from "vitest";
import type { AssetStorage, TemporaryAsset, PermanentAsset } from "@/core/assets/asset.types";
import { AssetService } from "@/core/assets/asset.service";

class FakeStorage implements AssetStorage {
  private store_ = new Map<string, { asset: TemporaryAsset | PermanentAsset; data: Buffer }>();

  async store(asset: TemporaryAsset | PermanentAsset, data: Buffer): Promise<string> {
    const key = `${asset.id.slice(0, 2)}/${asset.id}`;
    this.store_.set(key, { asset, data });
    return key;
  }

  async retrieve(key: string): Promise<Buffer | null> {
    return this.store_.get(key)?.data ?? null;
  }

  async delete(key: string): Promise<void> {
    this.store_.delete(key);
  }

  async getUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    return `url:${key}`;
  }

  async list(_prefix?: string): Promise<string[]> {
    return Array.from(this.store_.keys());
  }
}

describe("AssetService", () => {
  it("should store a temporary asset", async () => {
    const storage = new FakeStorage();
    const service = new AssetService(storage);

    const asset = await service.store({
      id: "temp001",
      kind: "image",
      data: Buffer.from("img"),
      metadata: { filename: "img.png", mimeType: "image/png", sizeBytes: 100 },
      lifetime: "temporary",
      metadata_: {},
    });

    expect(asset.id).toBe("temp001");
    expect(asset.kind).toBe("image");
    expect(asset.expiresAt).toBeDefined();
  });

  it("should store a permanent asset", async () => {
    const storage = new FakeStorage();
    const service = new AssetService(storage);

    const asset = await service.store({
      id: "perm001",
      kind: "document",
      data: Buffer.from("pdf"),
      metadata: { filename: "doc.pdf", mimeType: "application/pdf", sizeBytes: 200 },
      lifetime: "permanent",
      metadata_: { permanent: true },
    });

    expect(asset.id).toBe("perm001");
    expect(asset.expiresAt).toBeDefined();
  });

  it("should retrieve asset data", async () => {
    const storage = new FakeStorage();
    const service = new AssetService(storage);

    await service.store({
      id: "retr001",
      kind: "video",
      data: Buffer.from("video"),
      metadata: { filename: "vid.mp4", mimeType: "video/mp4", sizeBytes: 300 },
      lifetime: "temporary",
      metadata_: {},
    });

    const data = await service.retrieve("retr001");
    expect(data).toEqual(Buffer.from("video"));
  });

  it("should delete an asset", async () => {
    const storage = new FakeStorage();
    const service = new AssetService(storage);

    await service.store({
      id: "del001",
      kind: "audio",
      data: Buffer.from("audio"),
      metadata: { filename: "audio.mp3", mimeType: "audio/mp3", sizeBytes: 150 },
      lifetime: "temporary",
      metadata_: {},
    });

    await service.delete("del001");
    const data = await service.retrieve("del001");
    expect(data).toBeNull();
  });

  it("should get download url", async () => {
    const storage = new FakeStorage();
    const service = new AssetService(storage);

    await service.store({
      id: "url001",
      kind: "custom",
      data: Buffer.from("bin"),
      metadata: { filename: "f.bin", mimeType: "application/octet-stream", sizeBytes: 50 },
      lifetime: "temporary",
      metadata_: {},
    });

    const url = await service.getDownloadUrl("url001");
    expect(url).toContain("url001");
  });
});