import { logger } from "@/core/logger";
import { logAction } from "@/core/audit/audit.service";
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
    _request: AIRequest,
    _config: AIProviderConfig,
  ): AsyncIterable<AIResponse> {
    yield* [];
  }

  async healthCheck(): Promise<AIHealth> {
    return {
      providerId: this.providerType,
      status: "healthy",
      latencyMs: 0,
      availability: 1,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
      retryCount: 0,
    };
  }

  async getModels(): Promise<AIModel[]> {
    return [
      {
        id: "openai/gpt-4o",
        providerId: "openrouter",
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
        providerId: "openrouter",
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
        providerId: "openrouter",
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

  async estimateCost(_request: AIRequest): Promise<number> {
    return 0.001;
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

  private async buildRequest(request: AIRequest, _config: AIProviderConfig): Promise<AIResponse> {
    return this.normalizeResponse({
      id: `openrouter-${crypto.randomUUID()}`,
      model: request.model,
      provider: this.providerType,
      content: "placeholder response",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    });
  }
}
