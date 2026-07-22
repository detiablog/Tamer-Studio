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

export class GeminiAdapter extends BaseProviderAdapter {
  readonly providerType = "google";

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
        id: "gemini-2.5-pro",
        providerId: "google",
        name: "gemini-2.5-pro",
        displayName: "Gemini 2.5 Pro",
        category: "text",
        contextLength: "1048576",
        inputTypes: ["text", "image"],
        outputTypes: ["text"],
        maxTokens: 65536,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        status: "Available",
      },
      {
        id: "gemini-2.5-flash",
        providerId: "google",
        name: "gemini-2.5-flash",
        displayName: "Gemini 2.5 Flash",
        category: "text",
        contextLength: "1048576",
        inputTypes: ["text", "image"],
        outputTypes: ["text"],
        maxTokens: 65536,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        status: "Available",
      },
      {
        id: "gemini-embedding-001",
        providerId: "google",
        name: "gemini-embedding-001",
        displayName: "Gemini Embedding 001",
        category: "embedding",
        contextLength: "2048",
        inputTypes: ["text"],
        outputTypes: ["embedding"],
        maxTokens: 0,
        supportsStreaming: false,
        supportsVision: false,
        supportsTools: false,
        status: "Available",
      },
    ];
  }

  async estimateCost(_request: AIRequest): Promise<number> {
    return 0.001;
  }

  private validateConfig(config: AIProviderConfig): void {
    if (!config.apiKey && !config.apiEndpoint) {
      throw this.buildError(
        "INVALID_CONFIG",
        "Gemini adapter requires apiKey or apiEndpoint",
        false,
      );
    }
  }

  private async buildRequest(request: AIRequest, _config: AIProviderConfig): Promise<AIResponse> {
    return this.normalizeResponse({
      id: `gemini-${crypto.randomUUID()}`,
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
