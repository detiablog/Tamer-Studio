import type { AIRuntime, RuntimeOptions, RuntimeResult } from "../runtime/types";
import type { AIRequest } from "../types/domain";
import { logger } from "@/core/logger";

export interface DebugContext {
  traceId: string;
  startTime: number;
  steps: DebugStep[];
}

export interface DebugStep {
  name: string;
  timestamp: string;
  durationMs: number;
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface MockProviderConfig {
  providerId: string;
  response?: string;
  latencyMs?: number;
  failureRate?: number;
  error?: { code: string; message: string };
}

export interface DryRunResult {
  request: AIRequest;
  selectedProvider: string | undefined;
  resolvedModel: string | undefined;
  estimatedCost: number;
  estimatedTokens: number;
  validationErrors: string[];
  wouldExecute: boolean;
  mockResponse?: string;
}

export interface DeveloperRuntime {
  enableDebugMode(): void;
  disableDebugMode(): void;
  isDebugMode(): boolean;
  executeWithDebug<T>(request: AIRequest, options?: RuntimeOptions): Promise<RuntimeResult<T> & { debug: DebugContext }>;
  executeWithMock<T>(request: AIRequest, mockResponse: string, options?: RuntimeOptions): Promise<RuntimeResult<T>>;
  dryRun(request: AIRequest): Promise<DryRunResult>;
  registerMockProvider(config: MockProviderConfig): void;
  unregisterMockProvider(providerId: string): void;
  getDebugHistory(): DebugContext[];
  clearDebugHistory(): void;
  setRequestInterceptor(interceptor: (request: AIRequest) => AIRequest | null): void;
  clearRequestInterceptor(): void;
}

export class DefaultDeveloperRuntime implements DeveloperRuntime {
  private debugEnabled = false;
  private mockProviders = new Map<string, MockProviderConfig>();
  private debugHistory: DebugContext[] = [];
  private requestInterceptor: ((request: AIRequest) => AIRequest | null) | null = null;
  private readonly maxHistory = 100;

  constructor(private runtime: AIRuntime) {}

  enableDebugMode(): void {
    this.debugEnabled = true;
    logger.info("Developer debug mode enabled");
  }

  disableDebugMode(): void {
    this.debugEnabled = false;
    logger.info("Developer debug mode disabled");
  }

  isDebugMode(): boolean {
    return this.debugEnabled;
  }

  async executeWithDebug<T>(
    request: AIRequest,
    options?: RuntimeOptions
  ): Promise<RuntimeResult<T> & { debug: DebugContext }> {
    const traceId = crypto.randomUUID();
    const debugContext: DebugContext = {
      traceId,
      startTime: Date.now(),
      steps: [],
    };

    const step1Start = Date.now();
    const processedRequest = this.applyInterceptor(request);
    debugContext.steps.push({
      name: "request_intercept",
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - step1Start,
      input: request,
      output: processedRequest,
    });

    const step2Start = Date.now();
    let result: RuntimeResult<T>;
    try {
      result = await this.runtime.execute<T>(processedRequest, options);
    } catch (error) {
      result = {
        success: false,
        error: {
          code: "debug_error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
    debugContext.steps.push({
      name: "runtime_execute",
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - step2Start,
      input: processedRequest,
      output: result.success ? result.data : result.error,
      error: result.error?.message,
    });

    this.debugHistory.push(debugContext);
    if (this.debugHistory.length > this.maxHistory) {
      this.debugHistory = this.debugHistory.slice(-this.maxHistory);
    }

    return { ...result, debug: debugContext };
  }

  async executeWithMock<T>(
    request: AIRequest,
    mockResponse: string,
    options?: RuntimeOptions
  ): Promise<RuntimeResult<T>> {
    const mockConfig: MockProviderConfig = {
      providerId: request.context.metadata?.providerId as string ?? "mock",
      response: mockResponse,
    };
    this.mockProviders.set(mockConfig.providerId, mockConfig);

    logger.info("Executing with mock provider", {
      providerId: mockConfig.providerId,
      requestId: request.id,
    });

    return {
      success: true,
      data: mockResponse as T,
    };
  }

  async dryRun(request: AIRequest): Promise<DryRunResult> {
    const validationErrors: string[] = [];

    if (!request.capability) {
      validationErrors.push("capability is required");
    }
    if (!request.payload) {
      validationErrors.push("payload is required");
    }

    const interceptResult = this.applyInterceptor(request);
    const effectiveRequest = interceptResult ?? request;

    let estimatedTokens = 0;
    const payloadStr = JSON.stringify(effectiveRequest.payload);
    estimatedTokens = Math.ceil(payloadStr.length / 4);

    const estimatedCost = estimatedTokens * 0.00001;

    return {
      request: effectiveRequest,
      selectedProvider: undefined,
      resolvedModel: effectiveRequest.model,
      estimatedCost,
      estimatedTokens,
      validationErrors,
      wouldExecute: validationErrors.length === 0,
      mockResponse: this.getMockResponse(effectiveRequest),
    };
  }

  registerMockProvider(config: MockProviderConfig): void {
    this.mockProviders.set(config.providerId, config);
    logger.info("Mock provider registered", { providerId: config.providerId });
  }

  unregisterMockProvider(providerId: string): void {
    this.mockProviders.delete(providerId);
    logger.info("Mock provider unregistered", { providerId });
  }

  getDebugHistory(): DebugContext[] {
    return [...this.debugHistory];
  }

  clearDebugHistory(): void {
    this.debugHistory = [];
  }

  setRequestInterceptor(interceptor: (request: AIRequest) => AIRequest | null): void {
    this.requestInterceptor = interceptor;
  }

  clearRequestInterceptor(): void {
    this.requestInterceptor = null;
  }

  private applyInterceptor(request: AIRequest): AIRequest {
    if (!this.requestInterceptor) return request;
    const result = this.requestInterceptor(request);
    return result ?? request;
  }

  private getMockResponse(request: AIRequest): string | undefined {
    for (const config of this.mockProviders.values()) {
      if (config.response) return config.response;
    }
    return undefined;
  }
}

export function createDeveloperRuntime(runtime: AIRuntime): DeveloperRuntime {
  return new DefaultDeveloperRuntime(runtime);
}
