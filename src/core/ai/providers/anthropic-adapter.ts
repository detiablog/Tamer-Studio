import Anthropic from "@anthropic-ai/sdk";
import type { AIProviderAdapter, ProviderInput, ProviderOutput } from "../provider-registry";

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 0.003, output: 0.015 },
  "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
  "claude-3-5-haiku-20241022": { input: 0.001, output: 0.005 },
  "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
  "claude-3-sonnet-20240229": { input: 0.003, output: 0.015 },
  "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
};

export class AnthropicAdapter implements AIProviderAdapter {
  name = "anthropic";
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY environment variable is not set");
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async execute(input: ProviderInput): Promise<ProviderOutput> {
    const client = this.getClient();
    const startTime = Date.now();

    const response = await client.messages.create({
      model: input.model,
      max_tokens: input.maxTokens ?? 4096,
      temperature: input.temperature ?? 0.7,
      ...(input.systemPrompt ? { system: input.systemPrompt } : {}),
      messages: [{ role: "user", content: input.prompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const content = textBlock ? textBlock.text : "";
    const duration = Date.now() - startTime;

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      duration,
      model: response.model,
    };
  }

  estimateCost(input: ProviderInput): number {
    const pricing = MODEL_PRICING[input.model] ?? MODEL_PRICING["claude-3-5-sonnet-20241022"];
    const estimatedInputTokens = Math.ceil(input.prompt.length / 4);
    const estimatedOutputTokens = input.maxTokens ?? 1024;
    return (
      (estimatedInputTokens * pricing.input) / 1000 +
      (estimatedOutputTokens * pricing.output) / 1000
    );
  }

  getModels(): string[] {
    return Object.keys(MODEL_PRICING);
  }
}
