import OpenAI from "openai";
import type { AIProviderAdapter, ProviderInput, ProviderOutput } from "../provider-registry";

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "o1": { input: 0.015, output: 0.06 },
  "o1-mini": { input: 0.003, output: 0.012 },
  "o3-mini": { input: 0.0011, output: 0.0044 },
};

export class OpenAIAdapter implements AIProviderAdapter {
  name = "openai";
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async execute(input: ProviderInput): Promise<ProviderOutput> {
    const client = this.getClient();
    const startTime = Date.now();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (input.systemPrompt) {
      messages.push({ role: "system", content: input.systemPrompt });
    }
    messages.push({ role: "user", content: input.prompt });

    const response = await client.chat.completions.create({
      model: input.model,
      messages,
      max_tokens: input.maxTokens ?? 4096,
      temperature: input.temperature ?? 0.7,
    });

    const choice = response.choices[0];
    const duration = Date.now() - startTime;

    return {
      content: choice.message?.content ?? "",
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      duration,
      model: response.model,
    };
  }

  estimateCost(input: ProviderInput): number {
    const pricing = MODEL_PRICING[input.model] ?? MODEL_PRICING["gpt-4o"];
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
