import type { GatewayId, GatewayRuntimeState } from "./types";
import type { GatewayManager } from "../gateway-manager";
import type { GatewayPolicyEngine } from "../policy-engine";

export interface FailoverManager {
  getActiveGateway(state: GatewayRuntimeState): GatewayId | undefined;
  shouldFailover(primaryId: GatewayId, state: GatewayRuntimeState): boolean;
  selectFallback(policy: { primaryGatewayId: GatewayId; fallbackGatewayId?: GatewayId }, state: GatewayRuntimeState): GatewayId | undefined;
  markFailover(state: GatewayRuntimeState, gatewayId: GatewayId): GatewayRuntimeState;
  markRecovery(state: GatewayRuntimeState, gatewayId: GatewayId): GatewayRuntimeState;
}

export class DefaultFailoverManager implements FailoverManager {
  constructor(
    private gatewayManager: GatewayManager,
    private policyEngine: GatewayPolicyEngine,
  ) {}

  getActiveGateway(state: GatewayRuntimeState): GatewayId | undefined {
    if (state.activeGatewayId) return state.activeGatewayId;
    return state.primaryGatewayId;
  }

  shouldFailover(primaryId: GatewayId, state: GatewayRuntimeState): boolean {
    if (state.primaryGatewayId !== primaryId) return false;
    if (state.isFailover) return false;

    const health = state.health.get(primaryId);
    if (!health) return false;

    return health.status === "unhealthy" || health.availability < 50;
  }

  selectFallback(policy: { primaryGatewayId: GatewayId; fallbackGatewayId?: GatewayId }, state: GatewayRuntimeState): GatewayId | undefined {
    const fallbackId = policy.fallbackGatewayId;
    if (!fallbackId) return undefined;

    const fallbackHealth = state.health.get(fallbackId);
    if (fallbackHealth && fallbackHealth.status === "unhealthy") {
      return undefined;
    }

    if (!this.gatewayManager.has(fallbackId)) return undefined;

    return fallbackId;
  }

  markFailover(state: GatewayRuntimeState, gatewayId: GatewayId): GatewayRuntimeState {
    return {
      ...state,
      activeGatewayId: gatewayId,
      isFailover: true,
    };
  }

  markRecovery(state: GatewayRuntimeState, gatewayId: GatewayId): GatewayRuntimeState {
    const isPrimaryRecovered = gatewayId === state.primaryGatewayId;
    return {
      ...state,
      activeGatewayId: isPrimaryRecovered ? state.primaryGatewayId : state.activeGatewayId,
      isFailover: !isPrimaryRecovered,
    };
  }
}
