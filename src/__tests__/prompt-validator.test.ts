import { describe, it, expect } from "vitest";
import { promptValidatorService } from "@/core/prompt-intelligence/prompt-validator.service";

describe("Prompt Validator", () => {
  it("should reject empty prompt", async () => {
    const result = await promptValidatorService.validate("");
    expect(result.valid).toBe(false);
    expect(result.errors).toBeGreaterThan(0);
  });

  it("should detect broken variables", async () => {
    const result = await promptValidatorService.validate(
      "Hello {{undefined_var}}",
      undefined,
      ["known_var"]
    );
    expect(result.issues.some(i => i.code === "BROKEN_VARIABLE")).toBe(true);
  });

  it("should pass valid prompt", async () => {
    const result = await promptValidatorService.validate(
      "A professional photograph of a product with good lighting and composition"
    );
    expect(result.errors).toBe(0);
  });
});
