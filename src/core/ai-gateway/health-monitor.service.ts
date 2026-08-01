import { db } from "@/lib/db";
import { aiCircuitBreaker } from "@/lib/db/schema/ai-gateway";
import { aiProviderHealth } from "@/lib/db/schema/ai-runtime";
import { eq, and, desc, sql, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type ProviderStatus = "online" | "degraded" | "offline" | "unknown";
export type CircuitState = "closed" | "open" | "half_open";

export class HealthMonitorService {
  async getProviderHealth(providerId: string) {
    const [item] = await db.select().from(aiProviderHealth).where(eq(aiProviderHealth.providerId, providerId)).limit(1);
    return item || null;
  }

  async getAllProviderHealth() {
    return db.select().from(aiProviderHealth).orderBy(aiProviderHealth.providerId);
  }

  async recordHealthCheck(providerId: string, data: { status: ProviderStatus; latencyMs?: number; successRate?: number; failureRate?: number; totalRequests?: number; totalFailures?: number; lastError?: string }) {
    const existing = await this.getProviderHealth(providerId);
    const updateData: Record<string, unknown> = { status: data.status, lastCheckedAt: new Date() };
    if (data.latencyMs !== undefined) updateData.latencyMs = data.latencyMs;
    if (data.successRate !== undefined) updateData.successRate = String(data.successRate);
    if (data.failureRate !== undefined) updateData.failureRate = String(data.failureRate);
    if (data.totalRequests !== undefined) updateData.totalRequests = data.totalRequests;
    if (data.totalFailures !== undefined) updateData.totalFailures = data.totalFailures;
    if (data.lastError !== undefined) updateData.lastError = data.lastError;
    if (data.status === "online") updateData.lastSuccessAt = new Date();
    if (data.status === "offline") updateData.lastFailureAt = new Date();

    if (existing) {
      return db.update(aiProviderHealth).set(updateData).where(eq(aiProviderHealth.providerId, providerId)).returning().then(r => r[0]);
    }
    const id = generateId("aph");
    return db.insert(aiProviderHealth).values({ id, providerId, ...updateData }).returning().then(r => r[0]);
  }

  async getCircuitBreaker(providerId: string) {
    const [item] = await db.select().from(aiCircuitBreaker).where(eq(aiCircuitBreaker.providerId, providerId)).limit(1);
    return item || null;
  }

  async getOrCreateCircuitBreaker(providerId: string) {
    const existing = await this.getCircuitBreaker(providerId);
    if (existing) return existing;
    const id = generateId("acb");
    return db.insert(aiCircuitBreaker).values({ id, providerId }).returning().then(r => r[0]);
  }

  async recordCircuitBreakerSuccess(providerId: string) {
    const cb = await this.getOrCreateCircuitBreaker(providerId);
    const newState = (cb.state === "half_open" ? "closed" : cb.state) as CircuitState;
    const newSuccessCount = cb.state === "half_open" ? 0 : cb.successCount + 1;
    return db.update(aiCircuitBreaker).set({ state: newState, successCount: newSuccessCount, failureCount: 0, lastSuccessAt: new Date(), ...(newState !== cb.state ? { lastStateChangeAt: new Date() } : {}) }).where(eq(aiCircuitBreaker.providerId, providerId)).returning().then(r => r[0]);
  }

  async recordCircuitBreakerFailure(providerId: string) {
    const cb = await this.getOrCreateCircuitBreaker(providerId);
    const newFailureCount = cb.failureCount + 1;
    let newState = cb.state as CircuitState;
    if (newFailureCount >= cb.failureThreshold && cb.state === "closed") {
      newState = "open";
    } else if (cb.state === "half_open") {
      newState = "open";
    }
    return db.update(aiCircuitBreaker).set({ state: newState, failureCount: newFailureCount, lastFailureAt: new Date(), ...(newState !== cb.state ? { lastStateChangeAt: new Date() } : {}) }).where(eq(aiCircuitBreaker.providerId, providerId)).returning().then(r => r[0]);
  }

  async canExecute(providerId: string): Promise<{ allowed: boolean; reason?: string }> {
    const cb = await this.getCircuitBreaker(providerId);
    if (!cb) return { allowed: true };
    if (cb.state === "closed") return { allowed: true };
    if (cb.state === "open") {
      const timeSinceChange = Date.now() - new Date(cb.lastStateChangeAt).getTime();
      if (timeSinceChange >= cb.recoveryTimeoutMs) {
        await db.update(aiCircuitBreaker).set({ state: "half_open", lastStateChangeAt: new Date() }).where(eq(aiCircuitBreaker.providerId, providerId));
        return { allowed: true, reason: "Transitioning to half_open" };
      }
      return { allowed: false, reason: "Circuit breaker is open" };
    }
    if (cb.state === "half_open") {
      if (cb.successCount >= cb.halfOpenMaxAttempts) {
        await db.update(aiCircuitBreaker).set({ state: "closed", failureCount: 0, successCount: 0, lastStateChangeAt: new Date() }).where(eq(aiCircuitBreaker.providerId, providerId));
        return { allowed: true, reason: "Circuit breaker recovered" };
      }
      return { allowed: true, reason: "Circuit breaker in half_open" };
    }
    return { allowed: true };
  }

  async resetCircuitBreaker(providerId: string) {
    return db.update(aiCircuitBreaker).set({ state: "closed", failureCount: 0, successCount: 0, lastStateChangeAt: new Date() }).where(eq(aiCircuitBreaker.providerId, providerId)).returning().then(r => r[0]);
  }

  async getHealthStats() {
    const providers = await this.getAllProviderHealth();
    const breakers = await db.select().from(aiCircuitBreaker);
    return {
      providers: providers.map(p => ({ providerId: p.providerId, status: p.status, latencyMs: p.latencyMs, successRate: p.successRate, failureRate: p.failureRate, lastCheckedAt: p.lastCheckedAt })),
      circuitBreakers: breakers.map(cb => ({ providerId: cb.providerId, state: cb.state, failureCount: cb.failureCount, successCount: cb.successCount, lastStateChangeAt: cb.lastStateChangeAt })),
      totalOnline: providers.filter(p => p.status === "online").length,
      totalDegraded: providers.filter(p => p.status === "degraded").length,
      totalOffline: providers.filter(p => p.status === "offline").length,
      openCircuits: breakers.filter(cb => cb.state === "open").length,
    };
  }
}

export const healthMonitorService = new HealthMonitorService();
