import { db } from "@/lib/db";
import {
  conversionScore,
  conversionRecommendation,
  conversionExperiment,
  conversionReport,
} from "@/lib/db/schema/conversion-optimizer";
import { eq, and, desc, sql, like, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ConversionOptimizerService {
  async listScores(userId: string, filters?: { projectId?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(conversionScore.userId, userId)];
    if (filters?.projectId) conditions.push(eq(conversionScore.projectId, filters.projectId));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(conversionScore).where(where).orderBy(desc(conversionScore.calculatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(conversionScore).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createScore(userId: string, data: { projectId?: string; campaignId?: string; score?: number; breakdown?: Record<string, number>; factors?: Array<{ name: string; value: number; weight: number; explanation: string }>; metadata?: Record<string, unknown>; calculatedAt?: Date }) {
    const id = generateId("cvs");
    return db.insert(conversionScore).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getScore(id: string) {
    const [item] = await db.select().from(conversionScore).where(eq(conversionScore.id, id)).limit(1);
    return item || null;
  }

  async updateScore(id: string, data: Record<string, unknown>) {
    return db.update(conversionScore).set(data).where(eq(conversionScore.id, id)).returning().then((r) => r[0]);
  }

  async deleteScore(id: string) {
    await db.delete(conversionScore).where(eq(conversionScore.id, id));
  }

  async listRecommendations(userId: string, filters?: { projectId?: string; type?: string; priority?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(conversionRecommendation.userId, userId)];
    if (filters?.projectId) conditions.push(eq(conversionRecommendation.projectId, filters.projectId));
    if (filters?.type) conditions.push(eq(conversionRecommendation.type, filters.type));
    if (filters?.priority) conditions.push(eq(conversionRecommendation.priority, filters.priority));
    if (filters?.status) conditions.push(eq(conversionRecommendation.status, filters.status));
    if (filters?.search) conditions.push(like(conversionRecommendation.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(conversionRecommendation).where(where).orderBy(desc(conversionRecommendation.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(conversionRecommendation).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRecommendation(userId: string, data: { projectId?: string; type: string; category?: string; title: string; description?: string; problem?: string; reason?: string; expectedBenefit?: string; priority?: string; confidence?: number; platform?: string; status?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("cvr");
    return db.insert(conversionRecommendation).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getRecommendation(id: string) {
    const [item] = await db.select().from(conversionRecommendation).where(eq(conversionRecommendation.id, id)).limit(1);
    return item || null;
  }

  async updateRecommendation(id: string, data: Record<string, unknown>) {
    return db.update(conversionRecommendation).set(data).where(eq(conversionRecommendation.id, id)).returning().then((r) => r[0]);
  }

  async deleteRecommendation(id: string) {
    await db.delete(conversionRecommendation).where(eq(conversionRecommendation.id, id));
  }

  async listExperiments(userId: string, filters?: { projectId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(conversionExperiment.userId, userId)];
    if (filters?.projectId) conditions.push(eq(conversionExperiment.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(conversionExperiment.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(conversionExperiment).where(where).orderBy(desc(conversionExperiment.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(conversionExperiment).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createExperiment(userId: string, data: { projectId?: string; name: string; description?: string; variants?: Array<{ name: string; description: string; score: number }>; status?: string; winner?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("cve");
    return db.insert(conversionExperiment).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getExperiment(id: string) {
    const [item] = await db.select().from(conversionExperiment).where(eq(conversionExperiment.id, id)).limit(1);
    return item || null;
  }

  async updateExperiment(id: string, data: Record<string, unknown>) {
    return db.update(conversionExperiment).set(data).where(eq(conversionExperiment.id, id)).returning().then((r) => r[0]);
  }

  async deleteExperiment(id: string) {
    await db.delete(conversionExperiment).where(eq(conversionExperiment.id, id));
  }

  async listReports(userId: string, filters?: { projectId?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(conversionReport.userId, userId)];
    if (filters?.projectId) conditions.push(eq(conversionReport.projectId, filters.projectId));
    if (filters?.type) conditions.push(eq(conversionReport.type, filters.type));
    if (filters?.status) conditions.push(eq(conversionReport.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(conversionReport).where(where).orderBy(desc(conversionReport.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(conversionReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createReport(userId: string, data: { projectId?: string; name: string; type: string; data?: Record<string, unknown>; status?: string }) {
    const id = generateId("cvp");
    return db.insert(conversionReport).values({ ...data, id, userId }).returning().then((r) => r[0]);
  }

  async getReport(id: string) {
    const [item] = await db.select().from(conversionReport).where(eq(conversionReport.id, id)).limit(1);
    return item || null;
  }

  async updateReport(id: string, data: Record<string, unknown>) {
    return db.update(conversionReport).set(data).where(eq(conversionReport.id, id)).returning().then((r) => r[0]);
  }

  async deleteReport(id: string) {
    await db.delete(conversionReport).where(eq(conversionReport.id, id));
  }

  async getStats(userId: string) {
    const userCondition = eq(conversionScore.userId, userId);
    const [totalScores] = await db.select({ count: sql<number>`count(*)` }).from(conversionScore).where(userCondition);
    const [avgScore] = await db.select({ avg: sql<number>`coalesce(avg(${conversionScore.score}), 0)` }).from(conversionScore).where(userCondition);
    const [totalRecommendations] = await db.select({ count: sql<number>`count(*)` }).from(conversionRecommendation).where(eq(conversionRecommendation.userId, userId));
    const [newRecommendations] = await db.select({ count: sql<number>`count(*)` }).from(conversionRecommendation).where(and(eq(conversionRecommendation.userId, userId), eq(conversionRecommendation.status, "new")));
    const [implementedRecommendations] = await db.select({ count: sql<number>`count(*)` }).from(conversionRecommendation).where(and(eq(conversionRecommendation.userId, userId), eq(conversionRecommendation.status, "implemented")));
    const [highPriorityRecommendations] = await db.select({ count: sql<number>`count(*)` }).from(conversionRecommendation).where(and(eq(conversionRecommendation.userId, userId), eq(conversionRecommendation.priority, "high")));
    const [totalExperiments] = await db.select({ count: sql<number>`count(*)` }).from(conversionExperiment).where(eq(conversionExperiment.userId, userId));
    const [activeExperiments] = await db.select({ count: sql<number>`count(*)` }).from(conversionExperiment).where(and(eq(conversionExperiment.userId, userId), eq(conversionExperiment.status, "active")));
    const [completedExperiments] = await db.select({ count: sql<number>`count(*)` }).from(conversionExperiment).where(and(eq(conversionExperiment.userId, userId), eq(conversionExperiment.status, "completed")));
    const [totalReports] = await db.select({ count: sql<number>`count(*)` }).from(conversionReport).where(eq(conversionReport.userId, userId));
    return {
      totalScores: Number(totalScores?.count ?? 0),
      averageScore: Number(avgScore?.avg ?? 0),
      totalRecommendations: Number(totalRecommendations?.count ?? 0),
      newRecommendations: Number(newRecommendations?.count ?? 0),
      implementedRecommendations: Number(implementedRecommendations?.count ?? 0),
      highPriorityRecommendations: Number(highPriorityRecommendations?.count ?? 0),
      totalExperiments: Number(totalExperiments?.count ?? 0),
      activeExperiments: Number(activeExperiments?.count ?? 0),
      completedExperiments: Number(completedExperiments?.count ?? 0),
      totalReports: Number(totalReports?.count ?? 0),
    };
  }
}

export const conversionOptimizerService = new ConversionOptimizerService();
