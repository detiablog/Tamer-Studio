import type { ExecutionRequest, ExecutionResponse, ExecutionId, GatewayId, GatewayPolicy } from "./types";
import type { GatewayManager } from "./gateway-manager";
import type { GatewayPolicyEngine } from "./policy-engine";

export interface GatewayDispatcher {
  dispatch(request: ExecutionRequest, policy: GatewayPolicy): Promise<ExecutionResponse>;
  failureResponse(executionId: ExecutionId, code: string, message: string): ExecutionResponse;
}

export class DefaultGatewayDispatcher implements GatewayDispatcher {
  constructor(
    private gatewayManager: GatewayManager,
    private policyEngine: GatewayPolicyEngine,
  ) {}

  async dispatch(request: ExecutionRequest, policy: GatewayPolicy): Promise<ExecutionResponse> {
    const gatewayId = this.resolveGatewayId(request, policy);
    const gateway = this.gatewayManager.resolve(gatewayId);
    if (!gateway) {
      return this.failureResponse(request.executionId ?? ("exec_" + crypto.randomUUID().replace(/-/g, "")), "gateway_not_found", `Gateway ${gatewayId} not found`);
    }

    const health = this.gatewayManager.getHealth(gatewayId);
    if (health && health.status === "unhealthy") {
      const fallback = this.policyEngine.resolveFallbackGateway(policy);
      if (fallback) {
        const fallbackGateway = this.gatewayManager.resolve(fallback);
        if (fallbackGateway) {
          return this.execute(request, fallbackGateway, policy);
        }
      }
      return this.failureResponse(request.executionId ?? ("exec_" + crypto.randomUUID().replace(/-/g, "")), "gateway_unhealthy", `Gateway ${gatewayId} is unhealthy`);
    }

    return this.execute(request, gateway, policy);
  }

  private resolveGatewayId(request: ExecutionRequest, policy: GatewayPolicy): GatewayId {
    if (request.gatewayId) return request.gatewayId;
    const capabilityGateway = this.policyEngine.resolveGatewayForCapability(request.capabilityId, policy);
    if (capabilityGateway) return capabilityGateway;
    return this.policyEngine.resolvePrimaryGateway(policy);
  }

  private async execute(request: ExecutionRequest, gateway: { id: string }, policy: GatewayPolicy): Promise<ExecutionResponse> {
    const executionId = request.executionId ?? ("exec_" + crypto.randomUUID().replace(/-/g, ""));
    const timeoutMs = this.policyEngine.resolveTimeout(request.capabilityId, gateway.id, policy);
    const retryRule = this.policyEngine.resolveRetryRule(request.capabilityId, gateway.id, policy);

    const startTime = Date.now();
    let attempt = 0;

    while (this.policyEngine.shouldRetry(attempt, retryRule)) {
      try {
        const result = await this.runWithTimeout(executionId, gateway.id, request.payload, timeoutMs);
        const _durationMs = Date.now() - startTime;
        return {
          executionId,
          status: "completed",
          result,
          assets: [],
          usage: { requests: 1, estimatedCost: 0, currency: "USD" },
          durationMs: _durationMs,
        };
      } catch (error) {
        attempt++;
        if (!this.policyEngine.shouldRetry(attempt, retryRule)) {
          const _durationMs = Date.now() - startTime;
          return this.failureResponse(executionId, "execution_error", error instanceof Error ? error.message : "Unknown error");
        }
        await this.delay(retryRule.backoffMs * attempt);
      }
    }

    const _durationMs = Date.now() - startTime;
    return this.failureResponse(executionId, "max_retries_exceeded", `Failed after ${retryRule.maxAttempts} attempts`);
  }

  private async runWithTimeout(_executionId: string, _gatewayId: string, _payload: Record<string, unknown>, _timeoutMs: number): Promise<Record<string, unknown>> {
    return { status: "placeholder", message: "Provider integration pending" };
  }

  failureResponse(executionId: ExecutionId, code: string, message: string): ExecutionResponse {
    return {
      executionId,
      status: "failed",
      assets: [],
      usage: { requests: 1, estimatedCost: 0, currency: "USD" },
      durationMs: 0,
      error: { code, message },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
