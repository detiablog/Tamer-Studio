import { db } from "@/lib/db";
import { aiModelRegistry, aiCapabilityRegistry } from "@/lib/db/schema/ai-gateway";
import { eq, and, desc, sql, like, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type Capability = "text" | "chat" | "vision" | "image" | "video" | "speech" | "audio" | "embedding" | "reasoning" | "translation" | "code" | "moderation" | "ocr";

export class ModelRegistryService {
  async listModels(filters?: { providerId?: string; capability?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.providerId) conditions.push(eq(aiModelRegistry.providerId, filters.providerId));
    if (filters?.capability) conditions.push(eq(aiModelRegistry.capability, filters.capability));
    if (filters?.status) conditions.push(eq(aiModelRegistry.status, filters.status));
    if (filters?.search) conditions.push(like(aiModelRegistry.displayName, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(aiModelRegistry).where(where).orderBy(desc(aiModelRegistry.qualityScore)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(aiModelRegistry).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getModel(id: string) {
    const [item] = await db.select().from(aiModelRegistry).where(eq(aiModelRegistry.id, id)).limit(1);
    return item || null;
  }

  async getModelByProviderAndId(providerId: string, modelId: string) {
    const [item] = await db.select().from(aiModelRegistry).where(and(eq(aiModelRegistry.providerId, providerId), eq(aiModelRegistry.modelId, modelId))).limit(1);
    return item || null;
  }

  async createModel(data: { providerId: string; modelId: string; displayName: string; capability: string; costPer1kInput?: number; costPer1kOutput?: number; avgLatencyMs?: number; contextWindow?: number; maxOutput?: number; supportsStreaming?: boolean; supportsVision?: boolean; supportsJson?: boolean; supportsToolCalling?: boolean; qualityScore?: number; speedScore?: number; reliabilityScore?: number; version?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("amreg");
    return db.insert(aiModelRegistry).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateModel(id: string, data: Record<string, unknown>) {
    return db.update(aiModelRegistry).set(data).where(eq(aiModelRegistry.id, id)).returning().then(r => r[0]);
  }

  async deleteModel(id: string) {
    await db.delete(aiModelRegistry).where(eq(aiModelRegistry.id, id));
  }

  async getModelsByCapability(capability: string) {
    return db.select().from(aiModelRegistry).where(and(eq(aiModelRegistry.capability, capability), eq(aiModelRegistry.status, "active"))).orderBy(desc(aiModelRegistry.qualityScore));
  }

  async listCapabilities() {
    return db.select().from(aiCapabilityRegistry).orderBy(aiCapabilityRegistry.name);
  }

  async createCapability(data: { name: string; displayName: string; description?: string; category?: string }) {
    const id = generateId("acapa");
    return db.insert(aiCapabilityRegistry).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateCapability(id: string, data: Record<string, unknown>) {
    return db.update(aiCapabilityRegistry).set(data).where(eq(aiCapabilityRegistry.id, id)).returning().then(r => r[0]);
  }

  async deleteCapability(id: string) {
    await db.delete(aiCapabilityRegistry).where(eq(aiCapabilityRegistry.id, id));
  }

  async updateModelScores(id: string, scores: { qualityScore?: number; speedScore?: number; reliabilityScore?: number }) {
    return db.update(aiModelRegistry).set(scores).where(eq(aiModelRegistry.id, id)).returning().then(r => r[0]);
  }

  async getStats() {
    const [totalModels] = await db.select({ count: sql<number>`count(*)` }).from(aiModelRegistry);
    const [activeModels] = await db.select({ count: sql<number>`count(*)` }).from(aiModelRegistry).where(eq(aiModelRegistry.status, "active"));
    const [totalCapabilities] = await db.select({ count: sql<number>`count(*)` }).from(aiCapabilityRegistry);
    const byProvider = await db.select({ providerId: aiModelRegistry.providerId, count: sql<number>`count(*)` }).from(aiModelRegistry).groupBy(aiModelRegistry.providerId);
    const byCapability = await db.select({ capability: aiModelRegistry.capability, count: sql<number>`count(*)` }).from(aiModelRegistry).groupBy(aiModelRegistry.capability);

    return {
      totalModels: Number(totalModels?.count ?? 0),
      activeModels: Number(activeModels?.count ?? 0),
      totalCapabilities: Number(totalCapabilities?.count ?? 0),
      byProvider,
      byCapability,
    };
  }
}

export const modelRegistryService = new ModelRegistryService();
