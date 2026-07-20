import type { GatewayId, GatewayRuntimeState } from "./types";
import type { GatewayHealthMonitor } from "../health";
import type { FailoverManager } from "./failover-manager";

export interface RecoveryManager {
  startMonitoring(primaryId: GatewayId, intervalMs: number): void;
  stopMonitoring(): void;
  isMonitoring(): boolean;
  checkRecovery(state: GatewayRuntimeState): GatewayRuntimeState | undefined;
}

export class DefaultRecoveryManager implements RecoveryManager {
  private monitorInterval?: ReturnType<typeof setInterval>;
  private healthMonitor: GatewayHealthMonitor;
  private failoverManager: FailoverManager;
  private currentPrimaryId?: GatewayId;
  private intervalMs = 30000;

  constructor(healthMonitor: GatewayHealthMonitor, failoverManager: FailoverManager) {
    this.healthMonitor = healthMonitor;
    this.failoverManager = failoverManager;
  }

  startMonitoring(primaryId: GatewayId, intervalMs: number): void {
    if (this.monitorInterval) return;

    this.currentPrimaryId = primaryId;
    this.intervalMs = intervalMs;

    this.monitorInterval = setInterval(async () => {
      if (!this.currentPrimaryId) return;

      const health = await this.healthMonitor.checkHealth(this.currentPrimaryId);
      this.healthMonitor.updateHealth(health);
    }, this.intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
  }

  isMonitoring(): boolean {
    return this.monitorInterval !== undefined;
  }

  checkRecovery(state: GatewayRuntimeState): GatewayRuntimeState | undefined {
    if (!state.isFailover || !this.currentPrimaryId) return undefined;

    const primaryHealth = state.health.get(state.primaryGatewayId);
    if (!primaryHealth) return undefined;

    if (primaryHealth.status === "healthy" && primaryHealth.availability >= 80) {
      return this.failoverManager.markRecovery(state, state.primaryGatewayId);
    }

    return undefined;
  }
}
