import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProviderAdapter, ProviderInput, ProviderOutput } from "../provider-registry";

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-pro": { input: 0.00125, output: 0.01 },
  "gemini-2.5-flash": { input: 0.00015, output: 0.0006 },
  "gemini-2.0-flash": { input: 0.0001, output: 0.0004 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
};

export class GoogleAdapter implements AIProviderAdapter {
  name = "google";
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async execute(input: ProviderInput): Promise<ProviderOutput> {
    const genAI = this.getClient();
    const startTime = Date.now();

    const model = genAI.getGenerativeModel({
      model: input.model,
      systemInstruction: input.systemPrompt,
    });

    const result = await model.generateContent(input.prompt);
    const response = result.response;
    const content = response.text();
    const duration = Date.now() - startTime;

    const usageMetadata = response.usageMetadata;

    return {
      content,
      usage: {
        promptTokens: usageMetadata?.promptTokenCount ?? 0,
        completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: usageMetadata?.totalTokenCount ?? 0,
      },
      duration,
      model: input.model,
    };
  }

  estimateCost(input: ProviderInput): number {
    const pricing = MODEL_PRICING[input.model] ?? MODEL_PRICING["gemini-2.5-flash"];
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
