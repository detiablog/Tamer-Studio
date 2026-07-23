import { describe, it, expect } from "vitest";
import { AIServiceImage } from "@/core/ai/services";
import { FakeRuntime } from "@/core/ai/testing";

describe("AIServiceImage", () => {
  it("generates an image", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: {
        url: "https://example.com/img.png",
        width: 512,
        height: 512,
        mimeType: "image/png",
        provider: "openai",
        model: "dall-e-3",
        seed: 42,
        credits: 5,
        cost: 0.04,
        currency: "USD",
      },
    });

    const service = new AIServiceImage(fake);
    const result = await service.generate("A sunset over the ocean", {}, { workspaceId: "ws-1" });

    expect(result.id).toBe("https://example.com/img.png");
    expect(result.width).toBe(512);
    expect(result.height).toBe(512);
    expect(result.metadata.provider).toBe("openai");
    expect(result.metadata.seed).toBe(42);
  });

  it("throws on generation failure", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({ success: false, error: { code: "rate_limited", message: "rate limited" } });
    const service = new AIServiceImage(fake);

    await expect(service.generate("test")).rejects.toThrow("rate limited");
  });

  it("returns image metadata", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: {
        metadata: {
          provider: "openai",
          model: "dall-e-3",
          prompt: "A cat",
          seed: 123,
          credits: 3,
          cost: 0.02,
          currency: "USD",
          workspaceId: "ws-1",
          generationId: "gen-1",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });

    const service = new AIServiceImage(fake);
    const metadata = await service.getMetadata("img-1");
    expect(metadata.provider).toBe("openai");
    expect(metadata.seed).toBe(123);
  });
});
