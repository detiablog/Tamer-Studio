import { db } from "@/lib/db";
import { qualityRule, qualitySettings, qualityThreshold } from "@/lib/db/schema/quality-assurance";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class QualityRuleService {
  async listRules(userId: string, filters?: { category?: string; isEnabled?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(qualityRule.userId, userId)];
    if (filters?.category) conditions.push(eq(qualityRule.category, filters.category));
    if (filters?.isEnabled !== undefined) conditions.push(eq(qualityRule.isEnabled, filters.isEnabled));
    if (filters?.search) conditions.push(like(qualityRule.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(qualityRule).where(where).orderBy(desc(qualityRule.isDefault)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(qualityRule).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRule(userId: string, data: { name: string; description?: string; category?: string; minScore?: number; autoRetryThreshold?: number; maxRetryCount?: number; ignoredValidators?: string[]; mode?: string; isDefault?: boolean }) {
    const id = generateId("qrule");
    return db.insert(qualityRule).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getRule(id: string) {
    const [item] = await db.select().from(qualityRule).where(eq(qualityRule.id, id)).limit(1);
    return item || null;
  }

  async updateRule(id: string, data: Record<string, unknown>) {
    return db.update(qualityRule).set(data).where(eq(qualityRule.id, id)).returning().then(r => r[0]);
  }

  async deleteRule(id: string) {
    await db.delete(qualityRule).where(eq(qualityRule.id, id));
  }

  async toggleRule(id: string, isEnabled: boolean) {
    return db.update(qualityRule).set({ isEnabled }).where(eq(qualityRule.id, id)).returning().then(r => r[0]);
  }

  async getSettings(userId: string) {
    const [item] = await db.select().from(qualitySettings).where(eq(qualitySettings.userId, userId)).limit(1);
    if (!item) return this.createDefaults(userId);
    return item;
  }

  async upsertSettings(userId: string, data: { strictMode?: boolean; autoRetryEnabled?: boolean; autoRetryThreshold?: number; maxRetryCount?: number; defaultMinScore?: number; skipValidation?: boolean; notifyOnPass?: boolean; notifyOnFail?: boolean; enabledValidators?: string[]; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(qualitySettings).where(eq(qualitySettings.userId, userId)).limit(1);
    if (existing.length > 0) {
      return db.update(qualitySettings).set(data).where(eq(qualitySettings.userId, userId)).returning().then(r => r[0]);
    }
    const id = generateId("qset");
    return db.insert(qualitySettings).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  private async createDefaults(userId: string) {
    const id = generateId("qset");
    return db.insert(qualitySettings).values({ id, userId }).returning().then(r => r[0]);
  }

  async listThresholds() {
    return db.select().from(qualityThreshold).orderBy(qualityThreshold.category);
  }

  async upsertThreshold(data: { category: string; name: string; minValue?: number; maxValue?: number; weight?: number; isEnabled?: boolean }) {
    const existing = await db.select().from(qualityThreshold).where(and(eq(qualityThreshold.category, data.category), eq(qualityThreshold.name, data.name))).limit(1);
    if (existing.length > 0) {
      return db.update(qualityThreshold).set(data).where(eq(qualityThreshold.id, existing[0].id)).returning().then(r => r[0]);
    }
    const id = generateId("qthr");
    return db.insert(qualityThreshold).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getStats(userId: string) {
    const [totalRules] = await db.select({ count: sql<number>`count(*)` }).from(qualityRule).where(eq(qualityRule.userId, userId));
    const [activeRules] = await db.select({ count: sql<number>`count(*)` }).from(qualityRule).where(and(eq(qualityRule.userId, userId), eq(qualityRule.isEnabled, true)));
    const [totalThresholds] = await db.select({ count: sql<number>`count(*)` }).from(qualityThreshold);
    return { totalRules: Number(totalRules?.count ?? 0), activeRules: Number(activeRules?.count ?? 0), totalThresholds: Number(totalThresholds?.count ?? 0) };
  }
}

export const qualityRuleService = new QualityRuleService();
