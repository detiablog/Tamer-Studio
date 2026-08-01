import { db } from "@/lib/db";
import { aiRoutingDecision, aiModelRegistry, aiUserPreference } from "@/lib/db/schema/ai-gateway";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { healthMonitorService } from "./health-monitor.service";

export type RoutingMode = "balanced" | "fastest" | "cheapest" | "highest_quality" | "auto";
export type RoutingStrategy = "capability_match" | "cost_optimized" | "quality_optimized" | "speed_optimized" | "round_robin" | "user_preference" | "fallback";

export interface RoutingRequest {
  capability: string;
  userId?: string;
  maxCost?: number;
  maxLatencyMs?: number;
  preferredProvider?: string;
  preferredModel?: string;
  excludeProviders?: string[];
  excludeModels?: string[];
  mode?: RoutingMode;
}

export interface RoutingResult {
  providerId: string;
  modelId: string;
  capability: string;
  estimatedCost: number;
  estimatedLatencyMs: number;
  qualityScore: number;
  reason: string;
  strategy: RoutingStrategy;
}

export class RoutingEngineService {
  async route(request: RoutingRequest): Promise<RoutingResult | null> {
    const mode = request.mode || "balanced";
    const candidates = await this.getCandidates(request);
    if (candidates.length === 0) return null;

    const circuitChecks = await Promise.all(candidates.map(async c => {
      const check = await healthMonitorService.canExecute(c.providerId);
      return { ...c, circuitAllowed: check.allowed };
    }));

    const available = circuitChecks.filter(c => c.circuitAllowed);
    if (available.length === 0) {
      const fallback = circuitChecks[0];
      if (!fallback) return null;
      return this.buildResult(fallback, "fallback", "All providers circuit-broken, using first available");
    }

    const sorted = this.sortCandidates(available, mode);
    const best = sorted[0];
    const reason = this.getRoutingReason(best, mode);
    return this.buildResult(best, this.getStrategy(mode), reason);
  }

  private async getCandidates(request: RoutingRequest): Promise<(typeof aiModelRegistry.$inferSelect)[]> {
    const conditions = [eq(aiModelRegistry.status, "active"), eq(aiModelRegistry.capability, request.capability)];
    if (request.preferredProvider) conditions.push(eq(aiModelRegistry.providerId, request.preferredProvider));
    if (request.preferredModel) conditions.push(eq(aiModelRegistry.modelId, request.preferredModel));
    return db.select().from(aiModelRegistry).where(and(...conditions)).orderBy(desc(aiModelRegistry.qualityScore));
  }

  private sortCandidates(candidates: (typeof aiModelRegistry.$inferSelect)[], mode: RoutingMode): (typeof aiModelRegistry.$inferSelect)[] {
    switch (mode) {
      case "fastest": return [...candidates].sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
      case "cheapest": return [...candidates].sort((a, b) => a.costPer1kInput - b.costPer1kInput);
      case "highest_quality": return [...candidates].sort((a, b) => b.qualityScore - a.qualityScore);
      case "balanced": return [...candidates].sort((a, b) => (b.qualityScore * 0.4 + (100 - b.costPer1kInput * 1000) * 0.3 + (100 - b.avgLatencyMs) * 0.3) - (a.qualityScore * 0.4 + (100 - a.costPer1kInput * 1000) * 0.3 + (100 - a.avgLatencyMs) * 0.3));
      default: return [...candidates].sort((a, b) => b.qualityScore - a.qualityScore);
    }
  }

  private getStrategy(mode: RoutingMode): RoutingStrategy {
    switch (mode) {
      case "fastest": return "speed_optimized";
      case "cheapest": return "cost_optimized";
      case "highest_quality": return "quality_optimized";
      case "balanced": return "capability_match";
      default: return "capability_match";
    }
  }

  private getRoutingReason(model: typeof aiModelRegistry.$inferSelect, mode: RoutingMode): string {
    switch (mode) {
      case "fastest": return `Selected for lowest latency (${model.avgLatencyMs}ms)`;
      case "cheapest": return `Selected for lowest cost ($${model.costPer1kInput}/1K tokens)`;
      case "highest_quality": return `Selected for highest quality score (${model.qualityScore})`;
      case "balanced": return `Selected as optimal balance of quality, cost, and speed`;
      default: return `Selected based on capability match`;
    }
  }

  private buildResult(model: typeof aiModelRegistry.$inferSelect, strategy: RoutingStrategy, reason: string): RoutingResult {
    return {
      providerId: model.providerId,
      modelId: model.modelId,
      capability: model.capability,
      estimatedCost: model.costPer1kInput,
      estimatedLatencyMs: model.avgLatencyMs,
      qualityScore: model.qualityScore,
      reason,
      strategy,
    };
  }

  async recordDecision(data: { requestId: string; userId?: string; capability?: string; selectedProvider: string; selectedModel: string; fallbackProvider?: string; fallbackModel?: string; reason?: string; estimatedCost?: number; actualCost?: number; estimatedLatencyMs?: number; actualLatencyMs?: number; qualityScore?: number; wasFallback?: boolean; retryCount?: number; routingStrategy?: string }) {
    const id = generateId("ard");
    return db.insert(aiRoutingDecision).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listDecisions(filters?: { userId?: string; provider?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(aiRoutingDecision.userId, filters.userId));
    if (filters?.provider) conditions.push(eq(aiRoutingDecision.selectedProvider, filters.provider));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(aiRoutingDecision).where(where).orderBy(desc(aiRoutingDecision.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(aiRoutingDecision).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getUserPreferences(userId: string) {
    const [item] = await db.select().from(aiUserPreference).where(eq(aiUserPreference.userId, userId)).limit(1);
    return item || null;
  }

  async upsertUserPreferences(userId: string, data: { mode?: RoutingMode; maxCostPerRequest?: number; maxLatencyMs?: number; preferredProviders?: string[]; preferredModels?: string[]; excludedProviders?: string[]; excludedModels?: string[] }) {
    const existing = await this.getUserPreferences(userId);
    if (existing) {
      return db.update(aiUserPreference).set(data).where(eq(aiUserPreference.userId, userId)).returning().then(r => r[0]);
    }
    const id = generateId("aupref");
    return db.insert(aiUserPreference).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getRoutingStats() {
    const [totalDecisions] = await db.select({ count: sql<number>`count(*)` }).from(aiRoutingDecision);
    const [fallbackCount] = await db.select({ count: sql<number>`count(*)` }).from(aiRoutingDecision).where(eq(aiRoutingDecision.wasFallback, true));
    const byProvider = await db.select({ provider: aiRoutingDecision.selectedProvider, count: sql<number>`count(*)` }).from(aiRoutingDecision).groupBy(aiRoutingDecision.selectedProvider);
    const avgCost = await db.select({ avg: sql<number>`coalesce(avg(${aiRoutingDecision.actualCost}), 0)` }).from(aiRoutingDecision);
    const avgLatency = await db.select({ avg: sql<number>`coalesce(avg(${aiRoutingDecision.actualLatencyMs}), 0)` }).from(aiRoutingDecision);

    return {
      totalDecisions: Number(totalDecisions?.count ?? 0),
      fallbackCount: Number(fallbackCount?.count ?? 0),
      fallbackRate: Number(totalDecisions?.count ?? 0) > 0 ? Math.round((Number(fallbackCount?.count ?? 0) / Number(totalDecisions?.count ?? 1)) * 100) : 0,
      byProvider,
      avgCost: Number(avgCost[0]?.avg ?? 0),
      avgLatencyMs: Number(avgLatency[0]?.avg ?? 0),
    };
  }
}

export const routingEngineService = new RoutingEngineService();
