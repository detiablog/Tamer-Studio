import { AIError } from "../../errors/ai-error";

export type ProviderAuthType = "api_key" | "oauth" | "bearer";

export interface AIProviderConfig {
  apiKey?: string;
  apiEndpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
  model?: string;
  authType?: ProviderAuthType;
  headers?: Record<string, string>;
}

export interface AIRequest {
  model: string;
  prompt: string;
  capability?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stop?: string[];
    stream?: boolean;
    imageUrl?: string;
  };
}

export interface AIResponse {
  id: string;
  model: string;
  provider: string;
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AIHealth {
  providerId: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  latencyMs: number;
  availability: number;
  lastChecked: string;
  errorCount: number;
  retryCount: number;
}

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  category: string;
  contextLength: string;
  inputTypes: string[];
  outputTypes: string[];
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsTools: boolean;
  status: "Available" | "Preview" | "Deprecated";
}

export interface AIProviderAdapter {
  readonly providerType: string;
  execute(request: AIRequest, config: AIProviderConfig): Promise<AIResponse>;
  executeStream(
    request: AIRequest,
    config: AIProviderConfig,
  ): AsyncIterable<AIResponse>;
  healthCheck(): Promise<AIHealth>;
  getModels(): Promise<AIModel[]>;
  estimateCost(request: AIRequest): Promise<number>;
}

export abstract class BaseProviderAdapter implements AIProviderAdapter {
  abstract readonly providerType: string;
  abstract execute(request: AIRequest, config: AIProviderConfig): Promise<AIResponse>;
  abstract executeStream(
    request: AIRequest,
    config: AIProviderConfig,
  ): AsyncIterable<AIResponse>;
  abstract healthCheck(): Promise<AIHealth>;
  abstract getModels(): Promise<AIModel[]>;
  abstract estimateCost(request: AIRequest): Promise<number>;

  protected normalizeResponse(raw: unknown): AIResponse {
    if (typeof raw !== "object" || raw === null) {
      throw new AIError("Invalid response format", "INVALID_RESPONSE");
    }

    const response = raw as Record<string, unknown>;
    return {
      id: typeof response.id === "string" ? response.id : crypto.randomUUID(),
      model: typeof response.model === "string" ? response.model : "unknown",
      provider: this.providerType,
      content: typeof response.content === "string" ? response.content : "",
      finishReason: typeof response.finishReason === "string" ? response.finishReason : undefined,
      usage: typeof response.usage === "object" && response.usage !== null
        ? {
            promptTokens: (response.usage as Record<string, unknown>).promptTokens as number ?? 0,
            completionTokens: (response.usage as Record<string, unknown>).completionTokens as number ?? 0,
            totalTokens: (response.usage as Record<string, unknown>).totalTokens as number ?? 0,
          }
        : undefined,
      metadata: typeof response.metadata === "object" && response.metadata !== null
        ? (response.metadata as Record<string, unknown>)
        : undefined,
      createdAt: new Date().toISOString(),
    };
  }

  protected buildError(
    code: string,
    message: string,
    retryable = false,
  ): AIError & { retryable: boolean } {
    const error = new AIError(message, code, this.providerType);
    return Object.assign(error, { retryable });
  }
}
