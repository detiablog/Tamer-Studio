import { db } from "@/lib/db";
import {
  trendTopic,
  trendKeyword,
  trendHashtag,
  trendRecommendation,
  trendSaved,
  trendForecast,
  trendAlert,
} from "@/lib/db/schema/trend-analyzer";
import { eq, and, desc, sql, like, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class TrendAnalyzerService {
  async listTopics(userId: string, filters?: { status?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(trendTopic.userId, userId)];
    if (filters?.status) conditions.push(eq(trendTopic.status, filters.status));
    if (filters?.category) conditions.push(eq(trendTopic.category, filters.category));
    if (filters?.search) conditions.push(like(trendTopic.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(trendTopic).where(where).orderBy(desc(trendTopic.score)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendTopic).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createTopic(userId: string, data: { title: string; description?: string; category?: string; platforms?: string[]; keywords?: string[]; hashtags?: string[]; score?: number; velocity?: string; status?: string; metadata?: Record<string, unknown>; expiresAt?: Date }) {
    const id = generateId("trt");
    return db.insert(trendTopic).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getTopic(id: string) {
    const [item] = await db.select().from(trendTopic).where(eq(trendTopic.id, id)).limit(1);
    return item || null;
  }

  async updateTopic(id: string, data: Record<string, unknown>) {
    return db.update(trendTopic).set(data).where(eq(trendTopic.id, id)).returning().then((r) => r[0]);
  }

  async deleteTopic(id: string) {
    await db.delete(trendTopic).where(eq(trendTopic.id, id));
  }

  async listKeywords(userId: string, filters?: { keyword?: string; platform?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(trendKeyword.userId, userId)];
    if (filters?.keyword) conditions.push(like(trendKeyword.keyword, `%${filters.keyword}%`));
    if (filters?.platform) conditions.push(eq(trendKeyword.platform, filters.platform));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(trendKeyword).where(where).orderBy(desc(trendKeyword.popularity)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendKeyword).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createKeyword(userId: string, data: { keyword: string; platform?: string; popularity?: number; growth?: number; competition?: string; searchVolume?: number; relatedKeywords?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("trk");
    return db.insert(trendKeyword).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getKeyword(id: string) {
    const [item] = await db.select().from(trendKeyword).where(eq(trendKeyword.id, id)).limit(1);
    return item || null;
  }

  async updateKeyword(id: string, data: Record<string, unknown>) {
    return db.update(trendKeyword).set(data).where(eq(trendKeyword.id, id)).returning().then((r) => r[0]);
  }

  async deleteKeyword(id: string) {
    await db.delete(trendKeyword).where(eq(trendKeyword.id, id));
  }

  async listHashtags(userId: string, filters?: { hashtag?: string; platform?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(trendHashtag.userId, userId)];
    if (filters?.hashtag) conditions.push(like(trendHashtag.hashtag, `%${filters.hashtag}%`));
    if (filters?.platform) conditions.push(eq(trendHashtag.platform, filters.platform));
    if (filters?.category) conditions.push(eq(trendHashtag.category, filters.category));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(trendHashtag).where(where).orderBy(desc(trendHashtag.postCount)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendHashtag).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createHashtag(userId: string, data: { hashtag: string; platform?: string; postCount?: number; growth?: number; category?: string; confidence?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("trh");
    return db.insert(trendHashtag).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getHashtag(id: string) {
    const [item] = await db.select().from(trendHashtag).where(eq(trendHashtag.id, id)).limit(1);
    return item || null;
  }

  async updateHashtag(id: string, data: Record<string, unknown>) {
    return db.update(trendHashtag).set(data).where(eq(trendHashtag.id, id)).returning().then((r) => r[0]);
  }

  async deleteHashtag(id: string) {
    await db.delete(trendHashtag).where(eq(trendHashtag.id, id));
  }

  async listRecommendations(userId: string, filters?: { topicId?: string; type?: string; platform?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(trendRecommendation.userId, userId)];
    if (filters?.topicId) conditions.push(eq(trendRecommendation.topicId, filters.topicId));
    if (filters?.type) conditions.push(eq(trendRecommendation.type, filters.type));
    if (filters?.platform) conditions.push(eq(trendRecommendation.platform, filters.platform));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(trendRecommendation).where(where).orderBy(desc(trendRecommendation.score)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendRecommendation).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRecommendation(userId: string, data: { topicId?: string; type: string; title: string; description?: string; platform?: string; score?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("trr");
    return db.insert(trendRecommendation).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getRecommendation(id: string) {
    const [item] = await db.select().from(trendRecommendation).where(eq(trendRecommendation.id, id)).limit(1);
    return item || null;
  }

  async updateRecommendation(id: string, data: Record<string, unknown>) {
    return db.update(trendRecommendation).set(data).where(eq(trendRecommendation.id, id)).returning().then((r) => r[0]);
  }

  async deleteRecommendation(id: string) {
    await db.delete(trendRecommendation).where(eq(trendRecommendation.id, id));
  }

  async listSaved(userId: string, filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const where = eq(trendSaved.userId, userId);
    const [data, total] = await Promise.all([
      db.select().from(trendSaved).where(where).orderBy(desc(trendSaved.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendSaved).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createSaved(userId: string, data: { topicId: string; notes?: string }) {
    const id = generateId("trs");
    return db.insert(trendSaved).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async deleteSaved(id: string) {
    await db.delete(trendSaved).where(eq(trendSaved.id, id));
  }

  async listForecasts(userId: string, filters?: { topicId?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.topicId) conditions.push(eq(trendForecast.topicId, filters.topicId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(trendForecast).where(where).orderBy(desc(trendForecast.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendForecast).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createForecast(data: { topicId: string; predictedPeak?: Date; predictedDecline?: Date; confidence?: number; contentWindow?: string; notes?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("trf");
    return db.insert(trendForecast).values({ ...data, id }).returning().then((r) => r[0]);
  }

  async getForecast(id: string) {
    const [item] = await db.select().from(trendForecast).where(eq(trendForecast.id, id)).limit(1);
    return item || null;
  }

  async updateForecast(id: string, data: Record<string, unknown>) {
    return db.update(trendForecast).set(data).where(eq(trendForecast.id, id)).returning().then((r) => r[0]);
  }

  async deleteForecast(id: string) {
    await db.delete(trendForecast).where(eq(trendForecast.id, id));
  }

  async listAlerts(userId: string, filters?: { isActive?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(trendAlert.userId, userId)];
    if (filters?.isActive !== undefined) conditions.push(eq(trendAlert.isActive, filters.isActive));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(trendAlert).where(where).orderBy(desc(trendAlert.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(trendAlert).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createAlert(userId: string, data: { keyword?: string; category?: string; platform?: string; condition?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("tra");
    return db.insert(trendAlert).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getAlert(id: string) {
    const [item] = await db.select().from(trendAlert).where(eq(trendAlert.id, id)).limit(1);
    return item || null;
  }

  async updateAlert(id: string, data: Record<string, unknown>) {
    return db.update(trendAlert).set(data).where(eq(trendAlert.id, id)).returning().then((r) => r[0]);
  }

  async deleteAlert(id: string) {
    await db.delete(trendAlert).where(eq(trendAlert.id, id));
  }

  async getStats(userId: string) {
    const userCondition = eq(trendTopic.userId, userId);
    const [totalTopics] = await db.select({ count: sql<number>`count(*)` }).from(trendTopic).where(userCondition);
    const [activeTopics] = await db.select({ count: sql<number>`count(*)` }).from(trendTopic).where(and(userCondition, eq(trendTopic.status, "active")));
    const [totalKeywords] = await db.select({ count: sql<number>`count(*)` }).from(trendKeyword).where(eq(trendKeyword.userId, userId));
    const [totalHashtags] = await db.select({ count: sql<number>`count(*)` }).from(trendHashtag).where(eq(trendHashtag.userId, userId));
    const [totalRecommendations] = await db.select({ count: sql<number>`count(*)` }).from(trendRecommendation).where(eq(trendRecommendation.userId, userId));
    const [totalSaved] = await db.select({ count: sql<number>`count(*)` }).from(trendSaved).where(eq(trendSaved.userId, userId));
    const [totalAlerts] = await db.select({ count: sql<number>`count(*)` }).from(trendAlert).where(eq(trendAlert.userId, userId));
    const [activeAlerts] = await db.select({ count: sql<number>`count(*)` }).from(trendAlert).where(and(eq(trendAlert.userId, userId), eq(trendAlert.isActive, true)));
    const [avgTopicScore] = await db.select({ avg: sql<number>`coalesce(avg(${trendTopic.score}), 0)` }).from(trendTopic).where(userCondition);
    return {
      totalTopics: Number(totalTopics?.count ?? 0),
      activeTopics: Number(activeTopics?.count ?? 0),
      totalKeywords: Number(totalKeywords?.count ?? 0),
      totalHashtags: Number(totalHashtags?.count ?? 0),
      totalRecommendations: Number(totalRecommendations?.count ?? 0),
      totalSaved: Number(totalSaved?.count ?? 0),
      totalAlerts: Number(totalAlerts?.count ?? 0),
      activeAlerts: Number(activeAlerts?.count ?? 0),
      averageTopicScore: Number(avgTopicScore?.avg ?? 0),
    };
  }
}

export const trendAnalyzerService = new TrendAnalyzerService();
