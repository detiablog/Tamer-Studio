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

export class KiloAdapter extends BaseProviderAdapter {
  readonly providerType = "kilo";

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

    const endpoint = `${this.getBaseUrl(config)}/chat/completions`;
    const body = {
      model: request.model,
      messages: [{ role: "user", content: request.prompt }],
      temperature: request.options?.temperature,
      max_tokens: request.options?.maxTokens,
      top_p: request.options?.topP,
      stop: request.options?.stop,
      stream: true,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw this.buildError(
        "PROVIDER_HTTP_ERROR",
        `Kilo API responded with ${response.status}: ${text}`,
        response.status >= 500,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content ?? "";
          if (!content) continue;

          yield this.normalizeResponse({
            id: parsed.id ?? crypto.randomUUID(),
            model: parsed.model ?? request.model,
            provider: this.providerType,
            content,
            finishReason: parsed.choices?.[0]?.finish_reason,
          });
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  }

  async healthCheck(): Promise<AIHealth> {
    const start = Date.now();
    try {
      const endpoint = `${this.getBaseUrl({} as AIProviderConfig)}/health`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { ...({} as Record<string, string>) },
      });

      return {
        providerId: this.providerType,
        status: response.ok ? "healthy" : "degraded",
        latencyMs: Date.now() - start,
        availability: response.ok ? 1 : 0,
        lastChecked: new Date().toISOString(),
        errorCount: response.ok ? 0 : 1,
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
        id: "kilo-pro",
        providerId: this.providerType,
        name: "kilo-pro",
        displayName: "Kilo Pro",
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
        id: "kilo-embed",
        providerId: this.providerType,
        name: "kilo-embed",
        displayName: "Kilo Embed",
        category: "embedding",
        contextLength: "8191",
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
      "kilo-pro": { input: 0.0005, output: 0.0015 },
      "kilo-embed": { input: 0.0001, output: 0 },
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
        "Kilo adapter requires apiKey or apiEndpoint",
        false,
      );
    }
  }

  private getBaseUrl(config: AIProviderConfig): string {
    return (config.apiEndpoint ?? "http://localhost:11434").replace(/\/$/, "");
  }

  private async buildRequest(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
    const endpoint = `${this.getBaseUrl(config)}/chat/completions`;
    const body = {
      model: request.model,
      messages: [{ role: "user", content: request.prompt }],
      temperature: request.options?.temperature,
      max_tokens: request.options?.maxTokens,
      top_p: request.options?.topP,
      stop: request.options?.stop,
      stream: false,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        ...config.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw this.buildError(
        "PROVIDER_HTTP_ERROR",
        `Kilo API responded with ${response.status}: ${text}`,
        response.status >= 500,
      );
    }

    const data = await response.json();
    return this.normalizeResponse({
      id: data.id,
      model: data.model,
      provider: this.providerType,
      content: data.choices?.[0]?.message?.content,
      finishReason: data.choices?.[0]?.finish_reason,
      usage: data.usage,
    });
  }
}
