import { logger } from "@/core/logger";
import { logAction } from "@/core/audit/audit.service";
import OpenAI from "openai";
import type {
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AIHealth,
  AIModel,
} from "./adapter";
import { BaseProviderAdapter } from "./adapter";

export class OpenRouterAdapter extends BaseProviderAdapter {
  readonly providerType = "openrouter";

  async execute(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
    await logAction("provider.execution.started", undefined, undefined, {
      provider: this.providerType,
      model: request.model,
      capability: request.capability,
    });

    this.validateConfig(config);

    try {
      const response = await this.buildRequest(request, config);
      logger.info("Provider execution completed", {
        provider: this.providerType,
        model: request.model,
        capability: request.capability,
      });
      await logAction("provider.execution.completed", undefined, undefined, {
        provider: this.providerType,
        model: request.model,
        capability: request.capability,
      });
      return response;
    } catch (error) {
      logger.error("Provider execution failed", error as Error, {
        provider: this.providerType,
        model: request.model,
      });
      await logAction("provider.execution.failed", undefined, undefined, {
        provider: this.providerType,
        model: request.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw this.buildError(
        "PROVIDER_EXECUTION_ERROR",
        error instanceof Error ? error.message : "Unknown error",
        true,
      );
    }
  }

  async *executeStream(
    request: AIRequest,
    config: AIProviderConfig,
  ): AsyncIterable<AIResponse> {
    this.validateConfig(config);

    const client = this.createClient(config);
    const stream = await client.chat.completions.create({
      model: request.model,
      messages: [{ role: "user", content: request.prompt }],
      temperature: request.options?.temperature,
      max_tokens: request.options?.maxTokens,
      top_p: request.options?.topP,
      stop: request.options?.stop,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (!content) continue;

      yield this.normalizeResponse({
        id: chunk.id ?? crypto.randomUUID(),
        model: chunk.model ?? request.model,
        provider: this.providerType,
        content,
        finishReason: chunk.choices[0]?.finish_reason,
        usage: chunk.usage as typeof chunk.usage & { totalTokens?: number },
      });
    }
  }

  async healthCheck(): Promise<AIHealth> {
    const start = Date.now();
    try {
      const client = this.createClient({ apiKey: "placeholder" } as AIProviderConfig);
      await client.models.list({ timeout: 5_000 });
      return {
        providerId: this.providerType,
        status: "healthy",
        latencyMs: Date.now() - start,
        availability: 1,
        lastChecked: new Date().toISOString(),
        errorCount: 0,
        retryCount: 0,
      };
    } catch {
      return {
        providerId: this.providerType,
        status: "unhealthy",
        latencyMs: Date.now() - start,
        availability: 0,
        lastChecked: new Date().toISOString(),
        errorCount: 1,
        retryCount: 0,
      };
    }
  }

  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: "openai/gpt-4o",
        providerId: this.providerType,
        name: "openai/gpt-4o",
        displayName: "OpenAI GPT-4o (via OpenRouter)",
        category: "text",
        contextLength: "128000",
        inputTypes: ["text"],
        outputTypes: ["text"],
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: false,
        supportsTools: true,
        status: "Available",
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        providerId: this.providerType,
        name: "anthropic/claude-3.5-sonnet",
        displayName: "Claude 3.5 Sonnet (via OpenRouter)",
        category: "text",
        contextLength: "200000",
        inputTypes: ["text"],
        outputTypes: ["text"],
        maxTokens: 4096,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        status: "Available",
      },
      {
        id: "google/gemini-2.5-pro-lite",
        providerId: this.providerType,
        name: "google/gemini-2.5-pro-lite",
        displayName: "Gemini 2.5 Pro Lite (via OpenRouter)",
        category: "text",
        contextLength: "1048576",
        inputTypes: ["text"],
        outputTypes: ["text"],
        maxTokens: 65536,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        status: "Available",
      },
    ];
  }

  async estimateCost(request: AIRequest): Promise<number> {
    const pricing: Record<string, { input: number; output: number }> = {
      "openai/gpt-4o": { input: 0.0025, output: 0.01 },
      "anthropic/claude-3.5-sonnet": { input: 0.003, output: 0.015 },
      "google/gemini-2.5-pro-lite": { input: 0.00015, output: 0.0006 },
    };
    const price = pricing[request.model] ?? { input: 0.001, output: 0.002 };
    const promptTokens = request.prompt.length / 4;
    const completionTokens = request.options?.maxTokens ?? 256;
    return price.input * promptTokens + price.output * completionTokens;
  }

  private validateConfig(config: AIProviderConfig): void {
    if (!config.apiKey) {
      throw this.buildError(
        "INVALID_CONFIG",
        "OpenRouter adapter requires apiKey",
        false,
      );
    }
  }

  private createClient(config: AIProviderConfig) {
    return new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": config.headers?.["HTTP-Referer"] ?? "https://tamer-studio.local",
        "X-Title": config.headers?.["X-Title"] ?? "Tamer Studio",
        ...config.headers,
      },
    });
  }

  private async buildRequest(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
    const client = this.createClient(config);
    const completion = await client.chat.completions.create({
      model: request.model,
      messages: [{ role: "user", content: request.prompt }],
      temperature: request.options?.temperature,
      max_tokens: request.options?.maxTokens,
      top_p: request.options?.topP,
      stop: request.options?.stop,
    });

    const choice = completion.choices[0];
    return this.normalizeResponse({
      id: completion.id,
      model: completion.model,
      provider: this.providerType,
      content: choice.message.content,
      finishReason: choice.finish_reason,
      usage: completion.usage,
    });
  }
}
