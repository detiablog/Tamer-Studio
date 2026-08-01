import { db } from "@/lib/db";
import { aiModelRegistry, aiRequestLog } from "@/lib/db/schema/ai-gateway";
import { eq, and, desc, sql } from "drizzle-orm";

export interface CostEstimate {
  providerId: string;
  modelId: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUsd: number;
  estimatedCredits: number;
}

export class CostOptimizerService {
  async estimateCost(prompt: string, modelId?: string, providerId?: string, maxTokens?: number): Promise<CostEstimate[]> {
    const estimatedInputTokens = Math.ceil(prompt.length / 4);
    const estimatedOutputTokens = maxTokens || 1024;

    let conditions = [eq(aiModelRegistry.status, "active")];
    if (modelId) conditions.push(eq(aiModelRegistry.modelId, modelId));
    if (providerId) conditions.push(eq(aiModelRegistry.providerId, providerId));

    const models = await db.select().from(aiModelRegistry).where(and(...conditions)).orderBy(aiModelRegistry.costPer1kInput);

    return models.map(model => ({
      providerId: model.providerId,
      modelId: model.modelId,
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedCostUsd: (model.costPer1kInput * estimatedInputTokens / 1000) + (model.costPer1kOutput * estimatedOutputTokens / 1000),
      estimatedCredits: Math.ceil(((model.costPer1kInput * estimatedInputTokens / 1000) + (model.costPer1kOutput * estimatedOutputTokens / 1000)) * 100),
    }));
  }

  async getCheapestProvider(prompt: string, capability: string, maxTokens?: number): Promise<CostEstimate | null> {
    const estimates = await this.estimateCost(prompt, undefined, undefined, maxTokens);
    const capable = await db.select().from(aiModelRegistry).where(and(eq(aiModelRegistry.status, "active"), eq(aiModelRegistry.capability, capability)));
    const capableIds = new Set(capable.map(m => `${m.providerId}:${m.modelId}`));
    const filtered = estimates.filter(e => capableIds.has(`${e.providerId}:${e.modelId}`));
    return filtered.sort((a, b) => a.estimatedCostUsd - b.estimatedCostUsd)[0] || null;
  }

  async getCostAnalytics(userId?: string) {
    const conditions = userId ? [eq(aiRequestLog.userId, userId)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCost] = await db.select({ total: sql<number>`coalesce(sum(${aiRequestLog.costUsd}), 0)` }).from(aiRequestLog).where(where);
    const [avgCost] = await db.select({ avg: sql<number>`coalesce(avg(${aiRequestLog.costUsd}), 0)` }).from(aiRequestLog).where(where);
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${aiRequestLog.creditsUsed}), 0)` }).from(aiRequestLog).where(where);
    const byProvider = await db.select({ provider: aiRequestLog.provider, totalCost: sql<number>`coalesce(sum(${aiRequestLog.costUsd}), 0)`, count: sql<number>`count(*)` }).from(aiRequestLog).where(where).groupBy(aiRequestLog.provider);

    return {
      totalCostUsd: Number(totalCost?.total ?? 0),
      avgCostUsd: Number(avgCost?.avg ?? 0),
      totalCredits: Number(totalCredits?.total ?? 0),
      byProvider,
    };
  }
}

export const costOptimizerService = new CostOptimizerService();
