import type { ExecutionRequest, ExecutionResponse, GatewayPolicy } from "../types";
import type { GatewayRuntimeState } from "./types";
import type { GatewayManager } from "../gateway-manager";
import type { GatewayPolicyEngine } from "../policy-engine";
import type { GatewayDispatcher } from "../dispatcher";
import type { GatewayHealthMonitor } from "../health";
import type { GatewayMetricsCollector } from "../metrics";
import type { GatewayConfigurationLoader } from "../configuration";
import type { CircuitBreaker } from "./circuit-breaker";
import type { RetryManager } from "./retry-manager";
import type { FailoverManager } from "./failover-manager";
import type { RecoveryManager } from "./recovery-manager";
import type { RuntimeStateManager } from "./runtime-state";
import type { GatewayEventBus } from "./events";

export interface HighAvailabilityGatewayRuntime {
  start(): Promise<void>;
  stop(): void;
  dispatch(request: ExecutionRequest, policy: GatewayPolicy): Promise<ExecutionResponse>;
  getRuntimeState(): GatewayRuntimeState;
  refreshHealth(): Promise<void>;
}

export class DefaultHighAvailabilityGatewayRuntime implements HighAvailabilityGatewayRuntime {
  private started = false;

  constructor(
    private gatewayManager: GatewayManager,
    private policyEngine: GatewayPolicyEngine,
    private dispatcher: GatewayDispatcher,
    private healthMonitor: GatewayHealthMonitor,
    private metricsCollector: GatewayMetricsCollector,
    private configurationLoader: GatewayConfigurationLoader,
    private circuitBreaker: CircuitBreaker,
    private retryManager: RetryManager,
    private failoverManager: FailoverManager,
    private recoveryManager: RecoveryManager,
    private runtimeStateManager: RuntimeStateManager,
    private eventBus: GatewayEventBus,
  ) {}

  async start(): Promise<void> {
    if (this.started) return;

    const configuration = await this.configurationLoader.loadConfiguration();
    const primaryId = configuration.policies[0]?.primaryGatewayId ?? configuration.gateways[0]?.id;
    const fallbackId = configuration.policies[0]?.fallbackGatewayId;

    if (!primaryId) {
      throw new Error("No primary gateway configured");
    }

    this.runtimeStateManager.initialize(primaryId, fallbackId);
    this.recoveryManager.startMonitoring(primaryId, 30000);

    this.eventBus.emit({
      type: "gateway.health.changed",
      gatewayId: primaryId,
      timestamp: new Date().toISOString(),
      data: { status: "initialized" },
    });

    this.started = true;
  }

  stop(): void {
    this.recoveryManager.stopMonitoring();
    this.started = false;
  }

  async dispatch(request: ExecutionRequest, policy: GatewayPolicy): Promise<ExecutionResponse> {
    const gatewayId = this.resolveGatewayId(request, policy);
    const state = this.runtimeStateManager.getState();

    if (!this.circuitBreaker.allowRequest(gatewayId)) {
      const fallback = this.failoverManager.selectFallback(policy, state);
      if (fallback) {
        this.runtimeStateManager.setFailover(fallback);
        this.eventBus.emit({
          type: "gateway.failover.triggered",
          gatewayId: fallback,
          timestamp: new Date().toISOString(),
          data: { reason: "circuit_breaker_open", primary: gatewayId },
        });

        const fallbackResponse = await this.dispatcher.dispatch({ ...request, gatewayId: fallback }, policy);
        this.metricsCollector.recordRequest(fallback, fallbackResponse.status === "completed", fallbackResponse.durationMs);
        return fallbackResponse;
      }

      return this.dispatcher.failureResponse(request.executionId ?? ("exec_" + crypto.randomUUID().replace(/-/g, "")), "circuit_breaker_open", `Circuit breaker open for gateway ${gatewayId}`);
    }

    if (this.failoverManager.shouldFailover(gatewayId, state)) {
      const fallback = this.failoverManager.selectFallback(policy, state);
      if (fallback) {
        this.runtimeStateManager.setFailover(fallback);
        this.eventBus.emit({
          type: "gateway.failover.triggered",
          gatewayId: fallback,
          timestamp: new Date().toISOString(),
          data: { reason: "primary_unhealthy", primary: gatewayId },
        });

        const fallbackResponse = await this.dispatcher.dispatch({ ...request, gatewayId: fallback }, policy);
        this.metricsCollector.recordRequest(fallback, fallbackResponse.status === "completed", fallbackResponse.durationMs);
        return fallbackResponse;
      }
    }

    const response = await this.dispatcher.dispatch(request, policy);

    if (response.status === "completed") {
      this.circuitBreaker.recordSuccess(gatewayId);
      this.metricsCollector.recordRequest(gatewayId, true, response.durationMs);
      this.eventBus.emit({
        type: "gateway.request.completed",
        gatewayId,
        timestamp: new Date().toISOString(),
        data: { durationMs: response.durationMs },
      });
    } else {
      this.circuitBreaker.recordFailure(gatewayId);
      this.metricsCollector.recordRequest(gatewayId, false, response.durationMs);
      this.eventBus.emit({
        type: "gateway.request.failed",
        gatewayId,
        timestamp: new Date().toISOString(),
        data: { error: response.error },
      });
    }

    const recoveredState = this.recoveryManager.checkRecovery(this.runtimeStateManager.getState());
    if (recoveredState) {
      this.runtimeStateManager.setRecovery(gatewayId);
      this.eventBus.emit({
        type: "gateway.recovery.completed",
        gatewayId: state.primaryGatewayId,
        timestamp: new Date().toISOString(),
        data: { recoveredGateway: gatewayId },
      });
    }

    return response;
  }

  getRuntimeState(): GatewayRuntimeState {
    return this.runtimeStateManager.getState();
  }

  async refreshHealth(): Promise<void> {
    const configuration = await this.configurationLoader.loadConfiguration();
    for (const gateway of configuration.gateways) {
      const health = await this.healthMonitor.checkHealth(gateway.id);
      this.healthMonitor.updateHealth(health);
      this.runtimeStateManager.updateHealth(health);
      this.eventBus.emit({
        type: "gateway.health.changed",
        gatewayId: gateway.id,
        timestamp: new Date().toISOString(),
        data: health as unknown as Record<string, unknown>,
      });
    }
  }

  private resolveGatewayId(request: ExecutionRequest, policy: GatewayPolicy): string {
    if (request.gatewayId) return request.gatewayId;
    const capabilityGateway = this.policyEngine.resolveGatewayForCapability(request.capabilityId, policy);
    if (capabilityGateway) return capabilityGateway;
    return this.policyEngine.resolvePrimaryGateway(policy);
  }
}
