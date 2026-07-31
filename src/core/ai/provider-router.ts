import { getAvailableProviders } from "./provider-registry";
import { db } from "@/lib/db";
import { aiProviderHealth } from "@/lib/db/schema/ai-runtime";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface RoutingDecision {
  providerId: string;
  providerName: string;
  reason: string;
}

export class ProviderRouter {
  async selectProvider(taskType: string, preferredProvider?: string): Promise<RoutingDecision> {
    if (preferredProvider) {
      const isHealthy = await this.isHealthy(preferredProvider);
      if (isHealthy) return { providerId: preferredProvider, providerName: preferredProvider, reason: "user_preferred" };
    }
    const providers = getAvailableProviders();
    for (const provider of providers) {
      if (!provider.enabled) continue;
      const isHealthy = await this.isHealthy(provider.name);
      if (isHealthy) return { providerId: provider.name, providerName: provider.displayName, reason: "auto_select_healthy" };
    }
    const enabledProviders = providers.filter(p => p.enabled);
    if (enabledProviders.length > 0) {
      return { providerId: enabledProviders[0].name, providerName: enabledProviders[0].displayName, reason: "fallback_first" };
    }
    throw new Error("No AI providers available");
  }

  async isHealthy(providerId: string): Promise<boolean> {
    const [health] = await db.select().from(aiProviderHealth).where(eq(aiProviderHealth.providerId, providerId)).orderBy(desc(aiProviderHealth.updatedAt)).limit(1);
    if (!health) return true;
    if (health.status === "offline") return false;
    if (health.failureRate && parseFloat(health.failureRate) > 50) return false;
    return true;
  }

  async recordSuccess(providerId: string, latencyMs: number) {
    await this.updateHealth(providerId, "online", latencyMs, true);
  }

  async recordFailure(providerId: string, error: string) {
    await this.updateHealth(providerId, "offline", undefined, false, error);
  }

  private async updateHealth(providerId: string, status: string, latencyMs?: number, success?: boolean, error?: string) {
    const [existing] = await db.select().from(aiProviderHealth).where(eq(aiProviderHealth.providerId, providerId)).limit(1);
    if (existing) {
      const totalRequests = existing.totalRequests + 1;
      const totalFailures = existing.totalFailures + (success ? 0 : 1);
      const successRate = ((totalRequests - totalFailures) / totalRequests * 100).toFixed(1);
      const failureRate = (totalFailures / totalRequests * 100).toFixed(1);
      await db.update(aiProviderHealth).set({
        status,
        latencyMs: latencyMs ?? existing.latencyMs,
        successRate,
        failureRate,
        totalRequests,
        totalFailures,
        lastError: error || existing.lastError,
        lastCheckedAt: new Date(),
        lastSuccessAt: success ? new Date() : existing.lastSuccessAt,
        lastFailureAt: !success ? new Date() : existing.lastFailureAt,
        updatedAt: new Date(),
      }).where(eq(aiProviderHealth.id, existing.id));
    } else {
      await db.insert(aiProviderHealth).values({
        id: generateId("health"),
        providerId,
        status,
        latencyMs: latencyMs || null,
        successRate: success ? "100" : "0",
        failureRate: success ? "0" : "100",
        totalRequests: 1,
        totalFailures: success ? 0 : 1,
        lastCheckedAt: new Date(),
        lastError: error || null,
        lastSuccessAt: success ? new Date() : null,
        lastFailureAt: !success ? new Date() : null,
      });
    }
  }

  async getHealthStatus(): Promise<Array<{ providerId: string; status: string; latencyMs: number | null; successRate: string; totalRequests: number; lastCheckedAt: Date | null }>> {
    return db.select().from(aiProviderHealth).orderBy(aiProviderHealth.providerId);
  }
}

export const providerRouter = new ProviderRouter();
