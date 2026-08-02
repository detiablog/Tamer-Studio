import { describe, it, expect } from "vitest";
import { promptOptimizerService } from "@/core/prompt-intelligence/prompt-optimizer.service";

describe("Prompt Optimizer", () => {
  it("should optimize a basic prompt", async () => {
    const result = await promptOptimizerService.optimize("a coffee photo");
    expect(result.optimized).toBeDefined();
    expect(result.optimized.length).toBeGreaterThan(0);
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it("should add style adjective for image type", async () => {
    const result = await promptOptimizerService.optimize("a photo of a product", "image");
    expect(result.optimized.toLowerCase()).toContain("high-quality");
  });

  it("should capitalize first letter", async () => {
    const result = await promptOptimizerService.optimize("hello world");
    expect(result.optimized[0]).toBe("H");
  });
});
