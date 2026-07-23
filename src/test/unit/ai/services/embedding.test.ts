import { describe, it, expect } from "vitest";
import { AIServiceEmbedding } from "@/core/ai/services";
import { FakeRuntime } from "@/core/ai/testing";

describe("AIServiceEmbedding", () => {
  it("generates an embedding", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: {
        vector: [0.1, 0.2, 0.3],
        dimensions: 3,
        model: "text-embedding-ada-002",
      },
    });

    const service = new AIServiceEmbedding(fake);
    const result = await service.generate("Hello world");

    expect(result.vector).toEqual([0.1, 0.2, 0.3]);
    expect(result.dimensions).toBe(3);
    expect(result.model).toBe("text-embedding-ada-002");
  });

  it("batch embeds inputs", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: {
        embeddings: [
          { vector: [0.1], dimensions: 1, model: "ada-002" },
          { vector: [0.2], dimensions: 1, model: "ada-002" },
        ],
        model: "ada-002",
      },
    });

    const service = new AIServiceEmbedding(fake);
    const result = await service.batch({ inputs: ["a", "b"] });

    expect(result.embeddings).toHaveLength(2);
    expect(result.model).toBe("ada-002");
  });
});
