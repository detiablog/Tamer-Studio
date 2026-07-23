import { describe, it, expect } from "vitest";
import { AIServiceChat } from "@/core/ai/services";
import { FakeRuntime } from "@/core/ai/testing";

describe("AIServiceChat", () => {
  it("completes a chat", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: {
        message: { role: "assistant", content: "Hello back!" },
        conversationId: "conv-1",
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      },
    });

    const service = new AIServiceChat(fake);
    const result = await service.complete([{ role: "user", content: "Hello" }]);

    expect(result.message.content).toBe("Hello back!");
    expect(result.conversationId).toBe("conv-1");
    expect(result.usage.totalTokens).toBe(15);
  });

  it("streams chat responses", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: { content: "Streamed response", conversationId: "conv-2", promptTokens: 5, completionTokens: 3, totalTokens: 8 },
    });

    const service = new AIServiceChat(fake);
    const chunks: { content: string }[] = [];
    for await (const chunk of service.stream([{ role: "user", content: "Hi" }])) {
      chunks.push(chunk.message);
    }

    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].content).toBe("Streamed response");
  });
});
