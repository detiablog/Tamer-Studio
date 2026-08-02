import { describe, it, expect } from "vitest";
import { promptAnalyzerService } from "@/core/prompt-intelligence/prompt-analyzer.service";

describe("Prompt Analyzer", () => {
  it("should analyze a short prompt and give low score", async () => {
    const result = await promptAnalyzerService.analyze("hello");
    expect(result.qualityScore).toBeLessThan(60);
    expect(result.length).toBe(5);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should analyze a good prompt and give high score", async () => {
    const result = await promptAnalyzerService.analyze(
      "A cinematic professional product photograph of a premium coffee cup on a marble countertop, golden hour lighting, shallow depth of field, 4K resolution, commercial photography style"
    );
    expect(result.qualityScore).toBeGreaterThan(60);
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it("should detect variables in prompt", async () => {
    const result = await promptAnalyzerService.analyze(
      "A {{style}} photo of {{product_name}} for {{platform}}"
    );
    expect(result.hasVariables).toBe(true);
  });

  it("should detect unsafe content", async () => {
    const result = await promptAnalyzerService.analyze(
      "Create illegal harmful nsfw content"
    );
    expect(result.riskLevel).toBe("high");
  });

  it("should estimate tokens correctly", async () => {
    const result = await promptAnalyzerService.analyze(
      "This is a test prompt with approximately twenty words in it for testing purposes only"
    );
    expect(result.estimatedTokens).toBeGreaterThan(0);
  });
});
