import type { AIRuntime, AIHealth } from "./types";
import type {
  AIRequest,
  AIError,
  RuntimeOptions,
  RuntimeResult,
  TelemetryRecord,
  ProviderRegistry,
  ProviderSelector,
  ExecutionPipeline,
  TelemetryService,
} from "./types";
import { validateAIRequest, normalizeAIRequest } from "./validation";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";

export class DefaultAIRuntime implements AIRuntime {
  constructor(
    private providerRegistry: ProviderRegistry,
    private providerSelector: ProviderSelector,
    private executionPipeline: ExecutionPipeline,
    private telemetry: TelemetryService,
    private runtimeLogger = logger,
  ) {}

  async execute<T = unknown>(request: AIRequest, options?: RuntimeOptions): Promise<RuntimeResult<T>> {
    validateAIRequest(request);
    const normalizedRequest = normalizeAIRequest(request);

    const traceId = crypto.randomUUID();
    const spanId = crypto.randomUUID();
    const startTime = Date.now();

    const effectiveOptions: RuntimeOptions = {
      signal: options?.signal,
      timeoutMs: normalizedRequest.timeoutMs ?? options?.timeoutMs ?? 30000,
      telemetryEnabled: options?.telemetryEnabled ?? true,
      ...options,
    };

    if (effectiveOptions.signal?.aborted) {
      const error: AIError = { code: "cancelled", message: "Request was cancelled before execution" };
      this.logExecutionLifecycle("cancelled", normalizedRequest, error, Date.now() - startTime, traceId, spanId);
      return { success: false, error };
    }

    logAction("ai.generation.started", undefined, "system", {
      requestId: normalizedRequest.id!,
      capabilityId: normalizedRequest.capability,
      traceId,
      spanId,
    });

    try {
      const result = await this.executionPipeline.execute<T>(normalizedRequest, effectiveOptions, effectiveOptions.signal);

      const durationMs = Date.now() - startTime;

      if (result.success) {
        this.runtimeLogger.info("AI execution completed", {
          requestId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          traceId,
          spanId,
          durationMs,
        });
        logAction("ai.generation.completed", undefined, "system", {
          requestId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          traceId,
          spanId,
          durationMs,
        });
      } else {
        this.runtimeLogger.error("AI execution failed", undefined, {
          requestId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          traceId,
          spanId,
          durationMs,
          error: result.error,
        });
        logAction("ai.generation.failed", undefined, "system", {
          requestId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          traceId,
          spanId,
          durationMs,
          error: result.error,
        });
      }

      if (effectiveOptions.telemetryEnabled !== false) {
        const metadata = effectiveOptions.metadata ? { traceId, spanId, ...effectiveOptions.metadata } : { traceId, spanId };
        const telemetry: TelemetryRecord = {
          executionId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          status: result.success ? "success" : "failure",
          durationMs,
          timestamp: new Date().toISOString(),
          metadata,
        };
        this.telemetry.record(telemetry).catch(() => {});
      }

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const aiError: AIError = {
        code: "execution_error",
        message: error instanceof Error ? error.message : "Unknown error",
      };

      this.runtimeLogger.error("AI execution error", error instanceof Error ? error : undefined, {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
      });
      logAction("ai.generation.failed", undefined, "system", {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
        error: aiError,
      });

      if (effectiveOptions.telemetryEnabled !== false) {
        const metadata = effectiveOptions.metadata ? { traceId, spanId, ...effectiveOptions.metadata } : { traceId, spanId };
        const telemetry: TelemetryRecord = {
          executionId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          status: "failure",
          durationMs,
          timestamp: new Date().toISOString(),
          metadata,
        };
        this.telemetry.record(telemetry).catch(() => {});
      }

      return { success: false, error: aiError };
    }
  }

  async *executeStream<T = unknown>(request: AIRequest, options?: RuntimeOptions): AsyncIterable<RuntimeResult<T>> {
    validateAIRequest(request);
    const normalizedRequest = normalizeAIRequest(request);

    const traceId = crypto.randomUUID();
    const spanId = crypto.randomUUID();
    const startTime = Date.now();

    const effectiveOptions: RuntimeOptions = {
      signal: options?.signal,
      timeoutMs: normalizedRequest.timeoutMs ?? options?.timeoutMs ?? 30000,
      telemetryEnabled: options?.telemetryEnabled ?? true,
      ...options,
    };

    if (effectiveOptions.signal?.aborted) {
      const error: AIError = { code: "cancelled", message: "Request was cancelled before execution" };
      this.logExecutionLifecycle("cancelled", normalizedRequest, error, Date.now() - startTime, traceId, spanId);
      yield { success: false, error };
      return;
    }

    logAction("ai.generation.started", undefined, "system", {
      requestId: normalizedRequest.id!,
      capabilityId: normalizedRequest.capability,
      traceId,
      spanId,
    });

    let lastResult: RuntimeResult<T> | undefined;
    try {
      for await (const chunk of this.executionPipeline.executeStream<T>(normalizedRequest, effectiveOptions, effectiveOptions.signal)) {
        lastResult = chunk;
        yield chunk;
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const aiError: AIError = {
        code: "execution_error",
        message: error instanceof Error ? error.message : "Unknown error",
      };

      this.runtimeLogger.error("AI streaming execution failed", error instanceof Error ? error : undefined, {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
      });
      logAction("ai.generation.failed", undefined, "system", {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
        error: aiError,
      });

      if (effectiveOptions.telemetryEnabled !== false) {
        const metadata = effectiveOptions.metadata ? { traceId, spanId, ...effectiveOptions.metadata } : { traceId, spanId };
        const telemetry: TelemetryRecord = {
          executionId: normalizedRequest.id!,
          capabilityId: normalizedRequest.capability,
          status: "failure",
          durationMs,
          timestamp: new Date().toISOString(),
          metadata,
        };
        this.telemetry.record(telemetry).catch(() => {});
      }

      yield { success: false, error: aiError };
      return;
    }

    const durationMs = Date.now() - startTime;
    if (lastResult?.success) {
      this.runtimeLogger.info("AI streaming execution completed", {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
      });
      logAction("ai.generation.completed", undefined, "system", {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
      });
    } else if (lastResult?.error) {
      this.runtimeLogger.error("AI streaming execution failed", undefined, {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
        error: lastResult.error,
      });
      logAction("ai.generation.failed", undefined, "system", {
        requestId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        traceId,
        spanId,
        durationMs,
        error: lastResult.error,
      });
    }

    if (effectiveOptions.telemetryEnabled !== false) {
      const metadata = effectiveOptions.metadata ? { traceId, spanId, ...effectiveOptions.metadata } : { traceId, spanId };
      const telemetry: TelemetryRecord = {
        executionId: normalizedRequest.id!,
        capabilityId: normalizedRequest.capability,
        status: lastResult?.success ? "success" : "failure",
        durationMs,
        timestamp: new Date().toISOString(),
        metadata,
      };
      this.telemetry.record(telemetry).catch(() => {});
    }
  }

  async cancel(executionId: string): Promise<void> {
    await this.executionPipeline.cancel(executionId);
  }

  async getHealth(): Promise<AIHealth> {
    return this.providerRegistry.getHealth();
  }

  private logExecutionLifecycle(
    event: string,
    request: AIRequest,
    error?: AIError,
    durationMs?: number,
    traceId?: string,
    spanId?: string
  ): void {
    this.runtimeLogger.info(`[AI Runtime] ${event}`, {
      requestId: request.id,
      capability: request.capability,
      durationMs,
      error,
      traceId,
      spanId,
    });
  }
}
