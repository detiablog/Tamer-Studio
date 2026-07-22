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

export class OpenAiAdapter extends BaseProviderAdapter {
  readonly providerType = "openai";

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
      const client = this.createClient({ apiKey: "" } as AIProviderConfig);
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
    try {
      const client = this.createClient({ apiKey: "" } as AIProviderConfig);
      const models = await client.models.list();
      return models.data
        .filter((m) => m.id.startsWith("gpt-"))
        .map((m) => ({
          id: m.id,
          providerId: this.providerType,
          name: m.id,
          displayName: m.id,
          category: m.id.includes("embedding") ? "embedding" : "text",
          contextLength: "128000",
          inputTypes: ["text"],
          outputTypes: ["text"],
          maxTokens: 4096,
          supportsStreaming: true,
          supportsVision: false,
          supportsTools: true,
          status: "Available" as const,
        }));
    } catch {
      return [
        {
          id: "gpt-4o",
          providerId: "openai",
          name: "gpt-4o",
          displayName: "GPT-4o",
          category: "text",
          contextLength: "128000",
          inputTypes: ["text"],
          outputTypes: ["text"],
          maxTokens: 4096,
          supportsStreaming: true,
          supportsVision: true,
          supportsTools: true,
          status: "Available",
        },
        {
          id: "gpt-4o-mini",
          providerId: "openai",
          name: "gpt-4o-mini",
          displayName: "GPT-4o Mini",
          category: "text",
          contextLength: "128000",
          inputTypes: ["text"],
          outputTypes: ["text"],
          maxTokens: 4096,
          supportsStreaming: true,
          supportsVision: true,
          supportsTools: true,
          status: "Available",
        },
      ];
    }
  }

  async estimateCost(request: AIRequest): Promise<number> {
    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4o": { input: 0.0025, output: 0.01 },
      "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    };
    const price = pricing[request.model] ?? { input: 0.001, output: 0.002 };
    const promptTokens = request.prompt.length / 4;
    const completionTokens = request.options?.maxTokens ?? 256;
    return price.input * promptTokens + price.output * completionTokens;
  }

  private validateConfig(config: AIProviderConfig): void {
    if (!config.apiKey && !config.apiEndpoint) {
      throw this.buildError(
        "INVALID_CONFIG",
        "OpenAI adapter requires apiKey or apiEndpoint",
        false,
      );
    }
  }

  private createClient(config: AIProviderConfig) {
    return new OpenAI({
      apiKey: config.apiKey ?? undefined,
      baseURL: config.apiEndpoint ?? undefined,
      defaultHeaders: config.headers,
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
