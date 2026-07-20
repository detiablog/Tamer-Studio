import type { ExecutionRequest, ExecutionResponse, ExecutionLifecycleListener, ExecutionLifecycleEvent } from "./types";
import { generateExecutionId } from "./context";

export interface ExecutionEngine {
  execute(request: ExecutionRequest): Promise<ExecutionResponse>;
  addListener(listener: ExecutionLifecycleListener): void;
}

export class AIExecutionEngine implements ExecutionEngine {
  private listeners: ExecutionLifecycleListener[] = [];

  addListener(listener: ExecutionLifecycleListener): void {
    this.listeners.push(listener);
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const executionId = request.executionId ?? generateExecutionId();
    const startTime = Date.now();

    try {
      await this.emit("validate_request", { executionId, request });

      const capability = await this.resolveCapability(request.capabilityId);
      await this.emit("resolve_capability", { executionId, capability });

      const workflow = request.workflowId ? await this.resolveWorkflow(request.workflowId) : null;
      await this.emit("resolve_workflow", { executionId, workflow });

      const gateway = request.gatewayId ? await this.resolveGateway(request.gatewayId) : null;
      await this.emit("resolve_gateway", { executionId, gateway });

      const payload = await this.buildPayload(request);
      await this.emit("build_payload", { executionId, payload });

      const rawResult = await this.run(executionId, payload);
      await this.emit("execute", { executionId, result: rawResult });

      const normalizedResult = await this.normalizeResult(rawResult);
      await this.emit("normalize_result", { executionId, result: normalizedResult });

      const assets = await this.storeAssets(executionId);
      await this.emit("store_asset", { executionId, assets });

      const usage = this.calculateUsage();
      await this.emit("track_usage", { executionId, usage });

      const durationMs = Date.now() - startTime;
      const response: ExecutionResponse = {
        executionId,
        status: "completed",
        result: normalizedResult,
        assets,
        usage,
        durationMs,
        costEstimate: usage.estimatedCost > 0 ? usage.estimatedCost : undefined,
      };

      await this.emit("save_history", { executionId, response });
      await this.emit("return_response", { executionId, response });

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const response: ExecutionResponse = {
        executionId,
        status: "failed",
        assets: [],
        usage: { requests: 1, estimatedCost: 0, currency: "USD" },
        durationMs,
        error: {
          code: "execution_error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };

      await this.emit("return_response", { executionId, response });
      return response;
    }
  }

  private async emit(event: ExecutionLifecycleEvent, data: Record<string, unknown>): Promise<void> {
    for (const listener of this.listeners) {
      await listener.onEvent(event, data);
    }
  }

  private async resolveCapability(capabilityId: string): Promise<{ id: string; name: string }> {
    return { id: capabilityId, name: capabilityId };
  }

  private async resolveWorkflow(workflowId: string): Promise<{ id: string; name: string } | null> {
    return { id: workflowId, name: workflowId };
  }

  private async resolveGateway(gatewayId: string): Promise<{ id: string; name: string } | null> {
    return { id: gatewayId, name: gatewayId };
  }

  private async buildPayload(request: ExecutionRequest): Promise<Record<string, unknown>> {
    return request.payload;
  }

  private async run(_executionId: string, _payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return { status: "placeholder", message: "Provider integration pending" };
  }

  private async normalizeResult(result: Record<string, unknown>): Promise<Record<string, unknown>> {
    return result;
  }

  private async storeAssets(_executionId: string): Promise<{ assetId: string; type: "image" | "video" | "audio" | "document" | "text" | "binary" }[]> {
    return [];
  }

  private calculateUsage(): { requests: number; estimatedCost: number; currency: string } {
    return {
      requests: 1,
      estimatedCost: 0,
      currency: "USD",
    };
  }
}
