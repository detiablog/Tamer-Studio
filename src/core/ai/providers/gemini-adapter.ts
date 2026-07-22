import { logger } from "@/core/logger";
import { logAction } from "@/core/audit/audit.service";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    request: AIRequest,
    config: AIProviderConfig,
  ): AsyncIterable<AIResponse> {
    this.validateConfig(config);

    const client = this.createClient(config);
    const model = client.getGenerativeModel({ model: this.prefixModel(request.model) });
    const result = await model.generateContentStream(request.prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (!text) continue;

      yield this.normalizeResponse({
        id: crypto.randomUUID(),
        model: request.model,
        provider: this.providerType,
        content: text,
      });
    }
  }

  async healthCheck(): Promise<AIHealth> {
    const start = Date.now();
    try {
      const client = this.createClient({ apiKey: "" } as AIProviderConfig);
      const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent("ping");
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
        id: "gemini-2.5-pro",
        providerId: this.providerType,
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
        providerId: this.providerType,
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
        providerId: this.providerType,
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

  async estimateCost(request: AIRequest): Promise<number> {
    const pricing: Record<string, { input: number; output: number }> = {
      "gemini-2.5-pro": { input: 0.00125, output: 0.005 },
      "gemini-2.5-flash": { input: 0.00015, output: 0.0006 },
      "gemini-1.5-pro": { input: 0.0005, output: 0.0015 },
    };
    const price = pricing[request.model] ?? { input: 0.0005, output: 0.0015 };
    const promptTokens = request.prompt.length / 4;
    const completionTokens = request.options?.maxTokens ?? 256;
    return price.input * promptTokens + price.output * completionTokens;
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

  private createClient(config: AIProviderConfig) {
    const apiKey = config.apiKey ?? "";
    if (!apiKey) {
      throw this.buildError("INVALID_CONFIG", "Gemini adapter requires apiKey", false);
    }
    return new GoogleGenerativeAI(apiKey);
  }

  private prefixModel(model: string) {
    const normalized = model.startsWith("models/") ? model : `models/${model}`;
    return normalized;
  }

  private async buildRequest(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
    const client = this.createClient(config);
    const model = client.getGenerativeModel({ model: this.prefixModel(request.model) });
    const result = await model.generateContent(request.prompt);
    const response = result.response;
    const text = response.text();

    return this.normalizeResponse({
      id: crypto.randomUUID(),
      model: request.model,
      provider: this.providerType,
      content: text,
      usage: response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount,
        completionTokens: response.usageMetadata.candidatesTokenCount,
        totalTokens: response.usageMetadata.totalTokenCount,
      } : undefined,
    });
  }
}
