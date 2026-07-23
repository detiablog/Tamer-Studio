import { BaseAIService } from "../base";
import type { TextModerationRequest, ImageModerationRequest, ModerationResult, PromptValidationResult } from "./types";

export class AIServiceModeration extends BaseAIService {
  async text(request: TextModerationRequest): Promise<ModerationResult> {
    const result = await this.execute<ModerationResult>("moderation.text", { text: request.text }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Text moderation failed");
    }

    return result.data;
  }

  async image(request: ImageModerationRequest): Promise<ModerationResult> {
    const result = await this.execute<ModerationResult>("moderation.image", { imageUrl: request.imageUrl }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Image moderation failed");
    }

    return result.data;
  }

  async validatePrompt(prompt: string): Promise<PromptValidationResult> {
    const result = await this.execute<PromptValidationResult>("moderation.prompt", { prompt }, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Prompt validation failed");
    }

    return result.data;
  }

  async safetyValidate(prompt: string, imageUrl?: string): Promise<ModerationResult> {
    const payload: Record<string, unknown> = { prompt };
    if (imageUrl) payload.imageUrl = imageUrl;

    const result = await this.execute<ModerationResult>("moderation.safety", payload, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Safety validation failed");
    }

    return result.data;
  }

  async riskClassification(prompt: string, imageUrl?: string): Promise<{ riskScore: number; level: "low" | "medium" | "high" | "critical" }> {
    const payload: Record<string, unknown> = { prompt };
    if (imageUrl) payload.imageUrl = imageUrl;

    const result = await this.execute<{ riskScore: number; level: string }>("moderation.risk", payload, {});

    if (!result.success || !result.data) {
      throw new Error(result.error?.message ?? "Risk classification failed");
    }

    return { ...result.data, level: result.data.level as "low" | "medium" | "high" | "critical" };
  }
}
