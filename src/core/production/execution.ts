import { recordProductionMetric, recordUserActivity } from "@/core/analytics/aggregation";
import type { ProductionJob } from "@/features/production/production.store";

export interface ProductionExecutionConfig {
  productionId: string;
  workspaceId: string;
  userId: string;
  aiModel: string;
  workflowType: string;
  maxRetries?: number;
}

export interface ProductionExecutionResult {
  success: boolean;
  executionTimeMs: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Execute a production job and automatically record metrics
 * Wraps production execution with metrics recording, error handling, and retries
 */
export async function executeProductionWithMetrics(
  config: ProductionExecutionConfig,
  executor: () => Promise<ProductionExecutionResult>
): Promise<ProductionExecutionResult> {
  const startTime = Date.now();
  let result: ProductionExecutionResult;
  let status: "completed" | "failed" = "completed";

  try {
    // Execute the actual production logic
    result = await executor();
    status = result.success ? "completed" : "failed";
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    result = {
      success: false,
      executionTimeMs,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    status = "failed";
  }

  const executionTimeMs = result.executionTimeMs || Date.now() - startTime;

  // Record production metrics
  try {
    await recordProductionMetric({
      productionId: config.productionId,
      workspaceId: config.workspaceId,
      status,
      aiModel: config.aiModel,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.costUsd,
      executionTimeMs,
      metadata: {
        workflowType: config.workflowType,
        error: result.error,
        ...result.metadata,
      },
    });
  } catch (err) {
    console.error("Failed to record production metric:", err);
  }

  // Record user activity
  try {
    await recordUserActivity({
      userId: config.userId,
      workspaceId: config.workspaceId,
      action: status === "completed" ? "run_production_success" : "run_production_failure",
      resourceId: config.productionId,
      resourceType: "production",
    });
  } catch (err) {
    console.error("Failed to record user activity:", err);
  }

  return result;
}

/**
 * Stream production execution with real-time updates via WebSocket
 * Emits events for status changes, progress updates, and errors
 */
export async function streamProductionExecution(
  config: ProductionExecutionConfig,
  executor: (onProgress: (data: ProductionProgressUpdate) => void) => Promise<ProductionExecutionResult>,
  onProgress: (data: ProductionProgressUpdate) => void
): Promise<ProductionExecutionResult> {
  const startTime = Date.now();

  // Emit start event
  onProgress({
    status: "started",
    progress: 0,
    message: "Production execution started",
  });

  let result: ProductionExecutionResult;
  let executionStatus: "completed" | "failed" = "completed";

  try {
    result = await executor(onProgress);
    executionStatus = result.success ? "completed" : "failed";
  } catch (error) {
    result = {
      success: false,
      executionTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    executionStatus = "failed";

    onProgress({
      status: "error",
      progress: 100,
      message: result.error,
      error: result.error,
    });
  }

  const executionTimeMs = result.executionTimeMs || Date.now() - startTime;

  // Record metrics
  try {
    await recordProductionMetric({
      productionId: config.productionId,
      workspaceId: config.workspaceId,
      status: executionStatus,
      aiModel: config.aiModel,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.costUsd,
      executionTimeMs,
      metadata: {
        workflowType: config.workflowType,
        ...result.metadata,
      },
    });

    await recordUserActivity({
      userId: config.userId,
      workspaceId: config.workspaceId,
      action: "run_production",
      resourceId: config.productionId,
      resourceType: "production",
    });
  } catch (err) {
    console.error("Failed to record metrics:", err);
  }

  // Emit completion event
  onProgress({
    status: executionStatus,
    progress: 100,
    message: executionStatus === "completed" ? "Production completed successfully" : "Production failed",
    executionTimeMs,
    result,
  });

  return result;
}

export interface ProductionProgressUpdate {
  status: "started" | "running" | "completed" | "failed" | "error";
  progress: number; // 0-100
  message: string;
  error?: string;
  executionTimeMs?: number;
  result?: ProductionExecutionResult;
}

/**
 * Calculate cost based on token usage and AI model pricing
 */
export function calculateProductionCost(
  inputTokens: number,
  outputTokens: number,
  aiModel: string
): string {
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4": { input: 0.03, output: 0.06 },
    "gpt-4-turbo": { input: 0.01, output: 0.03 },
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    "claude-3-opus": { input: 0.015, output: 0.075 },
    "claude-3-sonnet": { input: 0.003, output: 0.015 },
    "claude-3-haiku": { input: 0.00025, output: 0.00125 },
    "llama-2-70b": { input: 0.001, output: 0.002 },
    "mistral-large": { input: 0.008, output: 0.024 },
  };

  const model = pricing[aiModel] || pricing["gpt-4"];
  const costUsd = (inputTokens * (model.input / 1000)) + (outputTokens * (model.output / 1000));
  return costUsd.toFixed(6);
}

/**
 * Estimate production execution time based on workflow type
 */
export function estimateExecutionTime(workflowType: string): string {
  const estimates: Record<string, string> = {
    "Image Generation": "2-5 minutes",
    "Video Generation": "10-30 minutes",
    "Audio Generation": "3-8 minutes",
    "Script Generation": "1-3 minutes",
    "Media Processing": "5-15 minutes",
    "Rendering": "15-60 minutes",
    "Publishing Preparation": "2-5 minutes",
    "Custom Workflow": "5-20 minutes",
  };
  return estimates[workflowType] || "5-15 minutes";
}
