import { db } from "@/lib/db";
import { learningEvent, learningHistory, learningSettings } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql, count as sqlCount } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type EventType = "project_created" | "prompt_used" | "image_generated" | "video_generated" | "story_created" | "published" | "analytics_viewed" | "conversion_report" | "trend_adopted" | "asset_used" | "workflow_used" | "automation_used" | "downloaded" | "favorited" | "rated" | "corrected" | "preference_changed" | "recommendation_accepted" | "recommendation_ignored";

export class LearningCollectorService {
  async recordEvent(userId: string, data: { eventType: EventType; category?: string; source?: string; entityId?: string; entityType?: string; data?: Record<string, unknown>; weight?: number }) {
    const settings = await this.checkSettings(userId);
    if (!settings.learningEnabled || settings.learningPaused) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayCount] = await db.select({ count: sql<number>`count(*)` }).from(learningEvent).where(and(eq(learningEvent.userId, userId), sql`${learningEvent.createdAt} >= ${todayStart}`));
    if (Number(todayCount?.count ?? 0) >= settings.maxEventsPerDay) return null;

    if (settings.excludedCategories.includes(data.category || "")) return null;

    const id = generateId("levt");
    const event = await db.insert(learningEvent).values({ ...data, id, userId }).returning().then(r => r[0]);

    await this.recordHistory(userId, { eventType: data.eventType, title: data.eventType.replace(/_/g, " "), description: `${data.eventType} from ${data.source || "system"}`, category: data.category, entityId: data.entityId, data: data.data || {} });

    return event;
  }

  async recordHistory(userId: string, data: { eventType: string; title: string; description?: string; category?: string; entityId?: string; data?: Record<string, unknown> }) {
    const id = generateId("lhst");
    return db.insert(learningHistory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listEvents(userId: string, filters?: { eventType?: string; category?: string; processed?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningEvent.userId, userId)];
    if (filters?.eventType) conditions.push(eq(learningEvent.eventType, filters.eventType));
    if (filters?.category) conditions.push(eq(learningEvent.category, filters.category));
    if (filters?.processed !== undefined) conditions.push(eq(learningEvent.processed, filters.processed));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningEvent).where(where).orderBy(desc(learningEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async listHistory(userId: string, filters?: { eventType?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningHistory.userId, userId)];
    if (filters?.eventType) conditions.push(eq(learningHistory.eventType, filters.eventType));
    if (filters?.category) conditions.push(eq(learningHistory.category, filters.category));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningHistory).where(where).orderBy(desc(learningHistory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningHistory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async checkSettings(userId: string) {
    const [item] = await db.select().from(learningSettings).where(eq(learningSettings.userId, userId)).limit(1);
    if (!item) return this.createDefaults(userId);
    return item;
  }

  async updateSettings(userId: string, data: { learningEnabled?: boolean; learningPaused?: boolean; confidenceThreshold?: number; maxEventsPerDay?: number; retentionDays?: number; excludedCategories?: string[]; notificationEnabled?: boolean }) {
    const existing = await this.checkSettings(userId);
    if (existing) {
      return db.update(learningSettings).set(data).where(eq(learningSettings.userId, userId)).returning().then(r => r[0]);
    }
    const id = generateId("lset");
    return db.insert(learningSettings).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  private async createDefaults(userId: string) {
    const id = generateId("lset");
    return db.insert(learningSettings).values({ id, userId }).returning().then(r => r[0]);
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(learningEvent).where(eq(learningEvent.userId, userId));
    const [processed] = await db.select({ count: sql<number>`count(*)` }).from(learningEvent).where(and(eq(learningEvent.userId, userId), eq(learningEvent.processed, true)));
    const [totalHistory] = await db.select({ count: sql<number>`count(*)` }).from(learningHistory).where(eq(learningHistory.userId, userId));
    return { totalEvents: Number(total?.count ?? 0), processedEvents: Number(processed?.count ?? 0), totalHistory: Number(totalHistory?.count ?? 0) };
  }
}

export const learningCollectorService = new LearningCollectorService();
