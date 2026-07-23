import { describe, it, expect } from "vitest";
import { AIServiceModeration } from "@/core/ai/services";
import { FakeRuntime } from "@/core/ai/testing";

describe("AIServiceModeration", () => {
  it("moderates text", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: {
        flagged: true,
        categories: { violence: true, hate: false },
        scores: { violence: 0.95, hate: 0.1 },
      },
    });

    const service = new AIServiceModeration(fake);
    const result = await service.text({ text: "bad text" });

    expect(result.flagged).toBe(true);
    expect(result.scores.violence).toBeCloseTo(0.95);
  });

  it("classifies risk", async () => {
    const fake = new FakeRuntime();
    fake.setNextResponse({
      success: true,
      data: { riskScore: 0.8, level: "high" },
    });

    const service = new AIServiceModeration(fake);
    const result = await service.riskClassification("risky prompt");

    expect(result.riskScore).toBe(0.8);
    expect(result.level).toBe("high");
  });
});
