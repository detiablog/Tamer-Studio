import { db } from "@/lib/db";
import { aiProvider, aiProviderModel } from "@/lib/db/schema/ai-providers";
import { aiProviderHealth } from "@/lib/db/schema/ai-runtime";
import { aiFeatureFlag, aiRoutingRule, aiRuntimeSetting, aiSafetyPolicy, aiAdminAction } from "@/lib/db/schema/ai-admin";
import { eq, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AIAdminService {
  async listProviders() {
    const providers = await db.select().from(aiProvider).orderBy(aiProvider.priority);
    const providerHealth = await db.select().from(aiProviderHealth);
    return providers.map(p => {
      const health = providerHealth.find(h => h.providerId === p.id);
      return {
        ...p,
        healthStatus: health?.status || "unknown",
        latencyMs: health?.latencyMs,
        successRate: health?.successRate,
        lastCheckedAt: health?.lastCheckedAt,
      };
    });
  }

  async getProvider(id: string) {
    const [provider] = await db.select().from(aiProvider).where(eq(aiProvider.id, id)).limit(1);
    if (!provider) return null;
    const models = await db.select().from(aiProviderModel).where(eq(aiProviderModel.providerId, id));
    const [health] = await db.select().from(aiProviderHealth).where(eq(aiProviderHealth.providerId, id)).orderBy(desc(aiProviderHealth.updatedAt)).limit(1);
    return { ...provider, models, health };
  }

  async updateProvider(id: string, data: Record<string, unknown>) {
    return db.update(aiProvider).set({ ...data, updatedAt: new Date() }).where(eq(aiProvider.id, id)).returning().then(r => r[0]);
  }

  async toggleProvider(id: string, enabled: boolean) {
    return db.update(aiProvider).set({ enabled, status: enabled ? "active" : "inactive", updatedAt: new Date() }).where(eq(aiProvider.id, id)).returning().then(r => r[0]);
  }

  async listModels(providerId?: string) {
    const where = providerId ? eq(aiProviderModel.providerId, providerId) : undefined;
    return db.select().from(aiProviderModel).where(where).orderBy(aiProviderModel.providerId);
  }

  async updateModel(id: string, data: Record<string, unknown>) {
    return db.update(aiProviderModel).set(data).where(eq(aiProviderModel.id, id)).returning().then(r => r[0]);
  }

  async getFeatureFlags() {
    return db.select().from(aiFeatureFlag).orderBy(aiFeatureFlag.name);
  }

  async toggleFeatureFlag(id: string, isEnabled: boolean) {
    return db.update(aiFeatureFlag).set({ isEnabled, updatedAt: new Date() }).where(eq(aiFeatureFlag.id, id)).returning().then(r => r[0]);
  }

  async createFeatureFlag(data: { name: string; description?: string; category: string; config?: Record<string, unknown>; createdBy?: string }) {
    const id = generateId("flag");
    return db.insert(aiFeatureFlag).values({ ...data, id, config: data.config || {} }).returning().then(r => r[0]);
  }

  async deleteFeatureFlag(id: string) {
    return db.delete(aiFeatureFlag).where(eq(aiFeatureFlag.id, id));
  }

  async getRoutingRules() {
    return db.select().from(aiRoutingRule).orderBy(aiRoutingRule.priority);
  }

  async createRoutingRule(data: { name: string; priority?: number; conditions?: Record<string, unknown>; targetProvider?: string | null; targetModel?: string | null; fallbackProvider?: string | null; isActive?: boolean; metadata?: Record<string, unknown>; createdBy?: string }) {
    const id = generateId("rule");
    return db.insert(aiRoutingRule).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateRoutingRule(id: string, data: Record<string, unknown>) {
    return db.update(aiRoutingRule).set({ ...data, updatedAt: new Date() }).where(eq(aiRoutingRule.id, id)).returning().then(r => r[0]);
  }

  async deleteRoutingRule(id: string) {
    return db.delete(aiRoutingRule).where(eq(aiRoutingRule.id, id));
  }

  async getRuntimeSettings() {
    return db.select().from(aiRuntimeSetting).orderBy(aiRuntimeSetting.key);
  }

  async updateSetting(key: string, value: unknown, description?: string, updatedBy?: string) {
    const [existing] = await db.select().from(aiRuntimeSetting).where(eq(aiRuntimeSetting.key, key)).limit(1);
    if (existing) {
      return db.update(aiRuntimeSetting).set({ value, description: description || existing.description, updatedBy, updatedAt: new Date() }).where(eq(aiRuntimeSetting.key, key)).returning().then(r => r[0]);
    }
    const id = generateId("setting");
    return db.insert(aiRuntimeSetting).values({ id, key, value, description: description || null, updatedBy }).returning().then(r => r[0]);
  }

  async getSafetyPolicies() {
    return db.select().from(aiSafetyPolicy).orderBy(aiSafetyPolicy.name);
  }

  async createSafetyPolicy(data: { name: string; type: string; rules?: Record<string, unknown>; isEnabled?: boolean; severity?: string; createdBy?: string }) {
    const id = generateId("spol");
    return db.insert(aiSafetyPolicy).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateSafetyPolicy(id: string, data: Record<string, unknown>) {
    return db.update(aiSafetyPolicy).set({ ...data, updatedAt: new Date() }).where(eq(aiSafetyPolicy.id, id)).returning().then(r => r[0]);
  }

  async deleteSafetyPolicy(id: string) {
    return db.delete(aiSafetyPolicy).where(eq(aiSafetyPolicy.id, id));
  }

  async getAdminActions(limit = 50) {
    return db.select().from(aiAdminAction).orderBy(desc(aiAdminAction.createdAt)).limit(limit);
  }

  async logAction(adminId: string, action: string, targetType: string, targetId?: string, details?: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return db.insert(aiAdminAction).values({ id: generateId("aact"), adminId, action, targetType, targetId: targetId || null, details: details || {}, ipAddress, userAgent });
  }

  async getDashboardStats() {
    const [totalProviders] = await db.select({ count: sql<number>`count(*)` }).from(aiProvider);
    const [enabledProviders] = await db.select({ count: sql<number>`count(*)` }).from(aiProvider).where(eq(aiProvider.enabled, true));
    const [totalModels] = await db.select({ count: sql<number>`count(*)` }).from(aiProviderModel);
    const [totalFlags] = await db.select({ count: sql<number>`count(*)` }).from(aiFeatureFlag);
    const [enabledFlags] = await db.select({ count: sql<number>`count(*)` }).from(aiFeatureFlag).where(eq(aiFeatureFlag.isEnabled, true));
    const [totalRules] = await db.select({ count: sql<number>`count(*)` }).from(aiRoutingRule);
    const [totalPolicies] = await db.select({ count: sql<number>`count(*)` }).from(aiSafetyPolicy);
    const [totalActions] = await db.select({ count: sql<number>`count(*)` }).from(aiAdminAction);
    return {
      totalProviders: Number(totalProviders?.count ?? 0),
      enabledProviders: Number(enabledProviders?.count ?? 0),
      totalModels: Number(totalModels?.count ?? 0),
      totalFlags: Number(totalFlags?.count ?? 0),
      enabledFlags: Number(enabledFlags?.count ?? 0),
      totalRules: Number(totalRules?.count ?? 0),
      totalPolicies: Number(totalPolicies?.count ?? 0),
      totalActions: Number(totalActions?.count ?? 0),
    };
  }
}

export const aiAdminService = new AIAdminService();
