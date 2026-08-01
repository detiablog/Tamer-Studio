import { db } from "@/lib/db";
import { learningPreference } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type PreferenceCategory = "creative" | "publishing" | "automation" | "projects" | "storytelling" | "affiliate" | "brand" | "visual_style" | "video_style" | "prompt_style" | "workflow";

export class PreferenceEngineService {
  async getPreference(userId: string, key: string) {
    const [item] = await db.select().from(learningPreference).where(and(eq(learningPreference.userId, userId), eq(learningPreference.key, key))).limit(1);
    return item || null;
  }

  async setPreference(userId: string, data: { category: string; key: string; value: string; confidence?: number; source?: string; isEditable?: boolean; isUserOverride?: boolean }) {
    const existing = await this.getPreference(userId, data.key);
    if (existing) {
      return db.update(learningPreference).set({ value: data.value, confidence: data.confidence ?? existing.confidence, source: data.source, isUserOverride: data.isUserOverride ?? existing.isUserOverride, updatedAt: new Date() }).where(eq(learningPreference.id, existing.id)).returning().then(r => r[0]);
    }
    const id = generateId("lpref");
    return db.insert(learningPreference).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listPreferences(userId: string, filters?: { category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningPreference.userId, userId)];
    if (filters?.category) conditions.push(eq(learningPreference.category, filters.category));
    if (filters?.search) conditions.push(like(learningPreference.key, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningPreference).where(where).orderBy(desc(learningPreference.confidence)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningPreference).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async deletePreference(id: string) {
    await db.delete(learningPreference).where(eq(learningPreference.id, id));
  }

  async overridePreference(userId: string, key: string, value: string) {
    return this.setPreference(userId, { category: "user_override", key, value, confidence: 100, source: "user_override", isEditable: true, isUserOverride: true });
  }

  async getPreferencesByCategory(userId: string, category: string) {
    return db.select().from(learningPreference).where(and(eq(learningPreference.userId, userId), eq(learningPreference.category, category))).orderBy(desc(learningPreference.confidence));
  }

  async getAllPreferences(userId: string) {
    return db.select().from(learningPreference).where(eq(learningPreference.userId, userId)).orderBy(desc(learningPreference.confidence));
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(learningPreference).where(eq(learningPreference.userId, userId));
    const [overridden] = await db.select({ count: sql<number>`count(*)` }).from(learningPreference).where(and(eq(learningPreference.userId, userId), eq(learningPreference.isUserOverride, true)));
    const [avgConfidence] = await db.select({ avg: sql<number>`coalesce(avg(${learningPreference.confidence}), 0)` }).from(learningPreference).where(eq(learningPreference.userId, userId));
    const byCategory = await db.select({ category: learningPreference.category, count: sql<number>`count(*)` }).from(learningPreference).where(eq(learningPreference.userId, userId)).groupBy(learningPreference.category);
    return { totalPreferences: Number(total?.count ?? 0), overriddenPreferences: Number(overridden?.count ?? 0), avgConfidence: Math.round(Number(avgConfidence?.avg ?? 0)), byCategory };
  }
}

export const preferenceEngineService = new PreferenceEngineService();
