import type { GatewayId, GatewayHealth, GatewayRuntimeState, GatewayEvent, CircuitBreakerSnapshot } from "./types";

export interface RuntimeStateManager {
  initialize(primaryId: GatewayId, fallbackId?: GatewayId): GatewayRuntimeState;
  updateHealth(health: GatewayHealth): GatewayRuntimeState;
  updateCircuitBreaker(snapshot: CircuitBreakerSnapshot): GatewayRuntimeState;
  recordEvent(event: GatewayEvent): GatewayRuntimeState;
  getState(): GatewayRuntimeState;
  setFailover(gatewayId: GatewayId): GatewayRuntimeState;
  setRecovery(gatewayId: GatewayId): GatewayRuntimeState;
}

export class InMemoryRuntimeStateManager implements RuntimeStateManager {
  private state: GatewayRuntimeState = {
    primaryGatewayId: "",
    fallbackGatewayId: undefined,
    activeGatewayId: undefined,
    isFailover: false,
    circuitBreakers: new Map(),
    health: new Map(),
  };

  initialize(primaryId: GatewayId, fallbackId?: GatewayId): GatewayRuntimeState {
    this.state = {
      primaryGatewayId: primaryId,
      fallbackGatewayId: fallbackId,
      activeGatewayId: primaryId,
      isFailover: false,
      circuitBreakers: new Map(),
      health: new Map(),
    };

    return this.state;
  }

  updateHealth(health: GatewayHealth): GatewayRuntimeState {
    this.state.health.set(health.gatewayId, health);
    return this.state;
  }

  updateCircuitBreaker(snapshot: CircuitBreakerSnapshot): GatewayRuntimeState {
    this.state.circuitBreakers.set(snapshot.gatewayId, snapshot);
    return this.state;
  }

  recordEvent(event: GatewayEvent): GatewayRuntimeState {
    this.state.lastEvent = event;
    return this.state;
  }

  getState(): GatewayRuntimeState {
    return this.state;
  }

  setFailover(gatewayId: GatewayId): GatewayRuntimeState {
    this.state.activeGatewayId = gatewayId;
    this.state.isFailover = true;
    return this.state;
  }

  setRecovery(gatewayId: GatewayId): GatewayRuntimeState {
    const isPrimaryRecovered = gatewayId === this.state.primaryGatewayId;
    this.state.activeGatewayId = isPrimaryRecovered ? this.state.primaryGatewayId : this.state.activeGatewayId;
    this.state.isFailover = !isPrimaryRecovered;
    return this.state;
  }
}
