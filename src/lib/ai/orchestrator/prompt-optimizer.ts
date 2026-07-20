import type { PromptOptimizationProfile, PromptContext } from "./types";

export interface PromptOptimizer {
  optimize(prompt: string, profile?: PromptOptimizationProfile, context?: PromptContext): Promise<string>;
}

export class DefaultPromptOptimizer implements PromptOptimizer {
  async optimize(prompt: string, profile?: PromptOptimizationProfile, _context?: PromptContext): Promise<string> {
    if (!profile) return prompt;

    let result = prompt;

    for (const rule of profile.rules) {
      switch (rule.type) {
        case "trim":
          result = this.trim(result, rule.params);
          break;
        case "expand":
          result = this.expand(result, rule.params);
          break;
        case "rephrase":
          result = this.rephrase(result, rule.params);
          break;
        case "structure":
          result = this.structure(result, rule.params);
          break;
        case "custom":
          result = this.applyCustom(result, rule.params);
          break;
      }
    }

    return result;
  }

  private trim(prompt: string, _params?: Record<string, unknown>): string {
    const lines = prompt.split("\n").filter((line) => line.trim().length > 0);
    return lines.join("\n").trim();
  }

  private expand(_prompt: string, _params?: Record<string, unknown>): string {
    return _prompt;
  }

  private rephrase(prompt: string, _params?: Record<string, unknown>): string {
    return prompt;
  }

  private structure(prompt: string, _params?: Record<string, unknown>): string {
    return prompt;
  }

  private applyCustom(prompt: string, _params?: Record<string, unknown>): string {
    return prompt;
  }
}
