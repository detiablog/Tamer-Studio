import type { AIRequest } from "../types/domain";
import type { AIProvider } from "@/core/admin/providers/providers.types";
import type { RuntimeOptions, RuntimeResult, TelemetryRecord } from "../runtime/types";
import type { AIError } from "../types/domain";
import type { ProviderSelector } from "../selector/provider-selector";
import type { ProviderRegistry } from "../registry/provider-registry";
import type { AdapterFactory } from "../providers/factory";
import type { RetryManager, RetryPolicy } from "../retry/retry-manager";
import type { CircuitBreaker } from "../breaker/circuit-breaker";
import type { FallbackManager } from "../fallback/fallback-manager";
import type { TelemetryService } from "../telemetry/telemetry.service";
import type { AIProviderConfig } from "../providers/adapter";
import { validateAIRequest, normalizeAIRequest } from "../runtime/validation";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";
import { randomUUID } from "crypto";

export interface ExecutionPipeline {
  execute<T>(request: AIRequest, options?: RuntimeOptions, signal?: AbortSignal): Promise<RuntimeResult<T>>;
  executeStream<T>(request: AIRequest, options?: RuntimeOptions, signal?: AbortSignal): AsyncIterable<RuntimeResult<T>>;
  cancel(executionId: string): Promise<void>;
}

type ProviderConfigAccess = {
  config?: {
    apiKey?: string;
    baseUrl?: string;
    timeoutMs?: number;
    retryCount?: number;
  };
};

export class DefaultExecutionPipeline implements ExecutionPipeline {
  private executions = new Map<string, AbortController>();

  constructor(
    private providerSelector: ProviderSelector,
    private providerRegistry: ProviderRegistry,
    private adapterFactory: AdapterFactory,
    private retryManager: RetryManager,
    private circuitBreaker: CircuitBreaker,
    private fallbackManager: FallbackManager,
    private telemetry: TelemetryService,
    private pipelineLogger = logger,
  ) {}

  async execute<T>(request: AIRequest, options?: RuntimeOptions, signal?: AbortSignal): Promise<RuntimeResult<T>> {
    validateAIRequest(request);
    const normalizedRequest = normalizeAIRequest(request);

    const executionId = `exec_${randomUUID()}`;
    const controller = new AbortController();
    this.executions.set(executionId, controller);

    const effectiveSignal = this.mergeSignals(signal, controller.signal);

    if (effectiveSignal.aborted) {
      this.executions.delete(executionId);
      const error: AIError = { code: "cancelled", message: "Request was cancelled before execution" };
      return { success: false, error };
    }

    const startTime = Date.now();
    const traceId = (normalizedRequest.context.metadata?.traceId as string | undefined) ?? randomUUID();
    const spanId = (normalizedRequest.context.metadata?.spanId as string | undefined) ?? randomUUID();

    logAction("provider.execution.started", undefined, "system", {
      executionId,
      requestId: normalizedRequest.id,
      capability: normalizedRequest.capability,
      traceId,
      spanId,
    });

    try {
      const providerId = await this.providerSelector.select(normalizedRequest);
      if (!providerId) {
        const error: AIError = { code: "NO_PROVIDER", message: "No provider available for capability" };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        return { success: false, error };
      }

      if (!this.circuitBreaker.allowRequest(providerId)) {
        const error: AIError = { code: "CIRCUIT_OPEN", message: `Circuit breaker open for ${providerId}` };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        return { success: false, error };
      }

      const provider = await this.providerRegistry.get(providerId);
      if (!provider) {
        const error: AIError = { code: "PROVIDER_NOT_FOUND", message: `Provider ${providerId} not found` };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        return { success: false, error };
      }

      const adapter = this.adapterFactory.getAdapter((provider as AIProvider).providerType);
      if (!adapter) {
        const error: AIError = { code: "ADAPTER_NOT_FOUND", message: `No adapter for provider type ${(provider as AIProvider).providerType}` };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        return { success: false, error };
      }

      const adapterRequest = this.mapToAdapterRequest(normalizedRequest);
      const adapterConfig: AIProviderConfig = {
        apiKey: (provider as ProviderConfigAccess).config?.apiKey,
        apiEndpoint: (provider as ProviderConfigAccess).config?.baseUrl,
        timeoutMs: (provider as ProviderConfigAccess).config?.timeoutMs,
        maxRetries: (provider as ProviderConfigAccess).config?.retryCount,
        model: normalizedRequest.model,
      };

      const retryPolicy: RetryPolicy = {
        maxAttempts: 3,
        backoffMs: 1000,
        backoffMultiplier: 2,
        maxBackoffMs: 30000,
      };

      let result: { content: string; model: string };
      let currentProviderId = providerId;
      let _fallbackUsed = false;

      try {
        const adapterResult = await this.retryManager.execute(
          () => adapter.execute(adapterRequest as unknown as Parameters<typeof adapter.execute>[0], adapterConfig),
          retryPolicy
        );
        result = {
          content: adapterResult.content,
          model: adapterResult.model,
        };
        this.circuitBreaker.recordSuccess(providerId);
      } catch (error) {
        this.circuitBreaker.recordFailure(providerId);

        const chain: string[] = [...(normalizedRequest.fallbackPolicy?.chain ?? [])];
        const nextProviderId = this.fallbackManager.selectFallback(
          providerId,
          chain
        );

        if (!nextProviderId) {
          throw error;
        }

        const fallbackProvider = await this.providerRegistry.get(nextProviderId);
        if (!fallbackProvider) {
          throw error;
        }

        const fallbackAdapter = this.adapterFactory.getAdapter((fallbackProvider as AIProvider).providerType);
        if (!fallbackAdapter) {
          throw error;
        }

        try {
          const fallbackResult = await this.retryManager.execute(
            () => fallbackAdapter.execute(adapterRequest as unknown as Parameters<typeof fallbackAdapter.execute>[0], adapterConfig),
            retryPolicy
          );
          result = {
            content: fallbackResult.content,
            model: fallbackResult.model,
          };
          this.circuitBreaker.recordSuccess(nextProviderId);
          currentProviderId = nextProviderId;
          _fallbackUsed = true;
        } catch (fallbackError) {
          this.circuitBreaker.recordFailure(nextProviderId);
          throw fallbackError;
        }
      }

      const durationMs = Date.now() - startTime;

      logAction("provider.execution.completed", undefined, "system", {
        executionId,
        requestId: normalizedRequest.id,
        providerId: currentProviderId,
        model: result.model,
        durationMs,
      });

      this.pipelineLogger.info("Pipeline execution completed", {
        executionId,
        requestId: normalizedRequest.id,
        providerId: currentProviderId,
        model: result.model,
        durationMs,
      });

      this.recordTelemetry(normalizedRequest, currentProviderId, "success", durationMs, traceId, spanId);

      this.executions.delete(executionId);
      return {
        success: true,
        data: result.content as T,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const aiError: AIError = {
        code: error instanceof Error ? error.message : "pipeline_error",
        message: error instanceof Error ? error.message : "Unknown pipeline error",
      };

      this.pipelineLogger.error("Pipeline execution failed", error instanceof Error ? error : undefined, {
        executionId,
        requestId: normalizedRequest.id,
        durationMs,
      });

      logAction("provider.execution.failed", undefined, "system", {
        executionId,
        requestId: normalizedRequest.id,
        durationMs,
        error: aiError,
      });

      this.recordTelemetry(normalizedRequest, undefined, "failure", durationMs, traceId, spanId);
      this.executions.delete(executionId);
      return { success: false, error: aiError };
    }
  }

  async *executeStream<T>(request: AIRequest, _options?: RuntimeOptions, _signal?: AbortSignal): AsyncIterable<RuntimeResult<T>> {
    validateAIRequest(request);
    const normalizedRequest = normalizeAIRequest(request);

    const executionId = `exec_${randomUUID()}`;
    const controller = new AbortController();
    this.executions.set(executionId, controller);

    const startTime = Date.now();
    const traceId = (normalizedRequest.context.metadata?.traceId as string | undefined) ?? randomUUID();
    const spanId = (normalizedRequest.context.metadata?.spanId as string | undefined) ?? randomUUID();

    logAction("provider.execution.started", undefined, "system", {
      executionId,
      requestId: normalizedRequest.id,
      traceId,
      spanId,
    });

    try {
      const providerId = await this.providerSelector.select(normalizedRequest);
      if (!providerId) {
        const error: AIError = { code: "NO_PROVIDER", message: "No provider available for capability" };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        yield { success: false, error } as RuntimeResult<T>;
        this.executions.delete(executionId);
        return;
      }

      const provider = await this.providerRegistry.get(providerId);
      if (!provider) {
        const error: AIError = { code: "PROVIDER_NOT_FOUND", message: `Provider ${providerId} not found` };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        yield { success: false, error } as RuntimeResult<T>;
        this.executions.delete(executionId);
        return;
      }

      const adapter = this.adapterFactory.getAdapter((provider as AIProvider).providerType);
      if (!adapter) {
        const error: AIError = { code: "ADAPTER_NOT_FOUND", message: `No adapter for provider type ${(provider as AIProvider).providerType}` };
        this.recordTelemetry(normalizedRequest, providerId, "failure", Date.now() - startTime, traceId, spanId);
        yield { success: false, error } as RuntimeResult<T>;
        this.executions.delete(executionId);
        return;
      }

      const adapterRequest = this.mapToAdapterRequest(normalizedRequest);
      const adapterConfig: AIProviderConfig = {
        apiKey: (provider as ProviderConfigAccess).config?.apiKey,
        apiEndpoint: (provider as ProviderConfigAccess).config?.baseUrl,
        timeoutMs: (provider as ProviderConfigAccess).config?.timeoutMs,
        maxRetries: (provider as ProviderConfigAccess).config?.retryCount,
        model: normalizedRequest.model,
      };

      try {
        for await (const chunk of adapter.executeStream(adapterRequest as unknown as Parameters<typeof adapter.executeStream>[0], adapterConfig)) {
          if (controller.signal.aborted) {
            break;
          }
          yield { success: true, data: chunk.content } as RuntimeResult<T>;
        }

        const durationMs = Date.now() - startTime;
        this.pipelineLogger.info("Pipeline stream completed", {
          executionId,
          requestId: normalizedRequest.id,
          durationMs,
        });
        this.recordTelemetry(normalizedRequest, providerId, "success", durationMs, traceId, spanId);
      } catch (error) {
        const durationMs = Date.now() - startTime;
        const aiError: AIError = {
          code: error instanceof Error ? error.message : "stream_error",
          message: error instanceof Error ? error.message : "Unknown stream error",
        };
        this.pipelineLogger.error("Pipeline stream failed", error instanceof Error ? error : undefined, {
          executionId,
          requestId: normalizedRequest.id,
          durationMs,
        });
        this.recordTelemetry(normalizedRequest, providerId, "failure", durationMs, traceId, spanId);
        yield { success: false, error: aiError } as RuntimeResult<T>;
      }

      this.executions.delete(executionId);
    } catch (error) {
      this.executions.delete(executionId);
      const aiError: AIError = {
        code: error instanceof Error ? error.message : "pipeline_stream_error",
        message: error instanceof Error ? error.message : "Unknown pipeline stream error",
      };
      yield { success: false, error: aiError } as RuntimeResult<T>;
    }
  }

  async cancel(executionId: string): Promise<void> {
    const controller = this.executions.get(executionId);
    if (controller) {
      controller.abort();
      this.executions.delete(executionId);
    }
  }

  private mergeSignals(signal: AbortSignal | undefined, controllerSignal: AbortSignal): AbortSignal {
    if (!signal) return controllerSignal;
    const merged = new AbortController();
    const abort = () => merged.abort();
    signal.addEventListener("abort", abort);
    controllerSignal.addEventListener("abort", abort);
    if (signal.aborted || controllerSignal.aborted) {
      merged.abort();
    }
    return merged.signal;
  }

  private mapToAdapterRequest(request: AIRequest): Record<string, unknown> {
    const payload = request.payload;
    return {
      model: request.model ?? "default",
      prompt: typeof payload?.prompt === "string" ? payload.prompt : JSON.stringify(payload ?? {}),
      capability: request.capability,
      options: {
        temperature: typeof payload?.temperature === "number" ? payload.temperature : 0.7,
        maxTokens: typeof payload?.maxTokens === "number" ? payload.maxTokens : 1024,
        topP: typeof payload?.topP === "number" ? payload.topP : undefined,
        stop: Array.isArray(payload?.stop) ? (payload.stop as string[]) : undefined,
        stream: false,
        imageUrl: typeof payload?.imageUrl === "string" ? payload.imageUrl : undefined,
      },
    } as Record<string, unknown>;
  }

  private async recordTelemetry(
    request: AIRequest,
    providerId: string | undefined,
    status: "success" | "failure",
    durationMs: number,
    traceId: string,
    spanId: string
  ): Promise<void> {
    const record: TelemetryRecord = {
      executionId: request.id ?? `req_${randomUUID()}`,
      capabilityId: request.capability,
      status,
      durationMs,
      timestamp: new Date().toISOString(),
      providerId,
      metadata: { traceId, spanId },
    };
    await this.telemetry.record(record).catch(() => {});
  }
}
