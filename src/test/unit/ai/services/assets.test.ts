import { describe, it, expect } from "vitest";
import { GeneratedImage, GeneratedVideo, GeneratedAudio, EmbeddingResult, ChatConversation, PromptAsset } from "@/core/ai/services";

describe("GeneratedImage", () => {
  it("creates an image asset", () => {
    const image = new GeneratedImage({
      id: "img-1",
      url: "https://example.com/img.png",
      width: 512,
      height: 512,
      mimeType: "image/png",
      metadata: {
        provider: "openai",
        model: "dall-e-3",
        prompt: "a cat",
        credits: 5,
        cost: 0.04,
        currency: "USD",
        workspaceId: "ws-1",
        generationId: "gen-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(image.width).toBe(512);
    expect(image.metadata.provider).toBe("openai");
  });
});

describe("GeneratedVideo", () => {
  it("creates a video asset", () => {
    const video = new GeneratedVideo({
      id: "vid-1",
      url: "https://example.com/vid.mp4",
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      mimeType: "video/mp4",
      metadata: {
        provider: "sora",
        model: "sora-1",
        prompt: "a sunset",
        duration: 10,
        credits: 100,
        cost: 1.0,
        currency: "USD",
        workspaceId: "ws-1",
        generationId: "gen-2",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(video.durationSeconds).toBe(10);
    expect(video.metadata.duration).toBe(10);
  });
});

describe("GeneratedAudio", () => {
  it("creates an audio asset", () => {
    const audio = new GeneratedAudio({
      id: "aud-1",
      url: "https://example.com/audio.mp3",
      durationSeconds: 60,
      mimeType: "audio/mpeg",
      metadata: {
        provider: "openai",
        model: "tts-1",
        prompt: "speak hello",
        duration: 60,
        credits: 10,
        cost: 0.06,
        currency: "USD",
        workspaceId: "ws-1",
        generationId: "gen-3",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(audio.durationSeconds).toBe(60);
  });
});

describe("EmbeddingResult", () => {
  it("creates an embedding", () => {
    const result = new EmbeddingResult(
      { vector: [0.1, 0.2, 0.3], dimensions: 3, model: "ada-002" },
      {
        provider: "openai",
        model: "ada-002",
        prompt: "test",
        credits: 0,
        cost: 0,
        currency: "USD",
        workspaceId: "ws-1",
        generationId: "gen-4",
        createdAt: "2026-01-01T00:00:00.000Z",
      }
    );

    expect(result.vector).toEqual([0.1, 0.2, 0.3]);
    expect(result.dimensions).toBe(3);
  });
});

describe("ChatConversation", () => {
  it("adds messages to a conversation", () => {
    const convo = new ChatConversation("conv-1", [], {
      provider: "",
      model: "",
      prompt: "",
      credits: 0,
      cost: 0,
      currency: "USD",
      workspaceId: "",
      projectId: "",
      generationId: "conv-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    const updated = convo.addMessage({ role: "user", content: "Hi", timestamp: "2026-01-01T00:00:01.000Z" });
    expect(updated.messages).toHaveLength(1);
    expect(updated.messages[0].content).toBe("Hi");
  });
});

describe("PromptAsset", () => {
  it("creates a prompt asset", () => {
    const asset = new PromptAsset({
      id: "asset-1",
      template: "Hello {{name}}",
      variables: { name: "World" },
      compiledPrompt: "Hello World",
      version: "1.0",
      metadata: {
        provider: "openai",
        model: "gpt-4",
        prompt: "Hello World",
        credits: 1,
        cost: 0.01,
        currency: "USD",
        workspaceId: "ws-1",
        generationId: "gen-5",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(asset.version).toBe("1.0");
    expect(asset.variables.name).toBe("World");
  });
});
