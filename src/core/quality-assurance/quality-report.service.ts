import { db } from "@/lib/db";
import {
  qualityReport,
  qualityScore,
  qualityValidation,
  qualityRecommendation,
  qualityRetryHistory,
  qualityAuditLog,
} from "@/lib/db/schema/quality-assurance";
import { eq, and, desc, sql, or, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class QualityReportService {
  async createReport(userId: string, data: { projectId?: string; assetId?: string; assetType: string; moduleType: string; status?: string; overallScore?: number; passed?: boolean; requiresReview?: boolean; summary?: string; scores?: Record<string, number>; metadata?: Record<string, unknown> }) {
    const id = generateId("qrep");
    return db.insert(qualityReport).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getReport(id: string) {
    const [item] = await db.select().from(qualityReport).where(eq(qualityReport.id, id)).limit(1);
    return item || null;
  }

  async getReportFull(id: string) {
    const report = await this.getReport(id);
    if (!report) return null;
    const [scores, validations, recommendations, retries] = await Promise.all([
      db.select().from(qualityScore).where(eq(qualityScore.reportId, id)),
      db.select().from(qualityValidation).where(eq(qualityValidation.reportId, id)),
      db.select().from(qualityRecommendation).where(eq(qualityRecommendation.reportId, id)),
      db.select().from(qualityRetryHistory).where(eq(qualityRetryHistory.reportId, id)),
    ]);
    return { ...report, scores, validations, recommendations, retries };
  }

  async listReports(userId: string, filters?: { projectId?: string; assetType?: string; moduleType?: string; status?: string; passed?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(qualityReport.userId, userId)];
    if (filters?.projectId) conditions.push(eq(qualityReport.projectId, filters.projectId));
    if (filters?.assetType) conditions.push(eq(qualityReport.assetType, filters.assetType));
    if (filters?.moduleType) conditions.push(eq(qualityReport.moduleType, filters.moduleType));
    if (filters?.status) conditions.push(eq(qualityReport.status, filters.status));
    if (filters?.passed !== undefined) conditions.push(eq(qualityReport.passed, filters.passed));
    if (filters?.search) conditions.push(or(like(qualityReport.summary, `%${filters.search}%`), like(qualityReport.assetId, `%${filters.search}%`))!);
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(qualityReport).where(where).orderBy(desc(qualityReport.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async updateReport(id: string, data: Record<string, unknown>) {
    return db.update(qualityReport).set(data).where(eq(qualityReport.id, id)).returning().then(r => r[0]);
  }

  async deleteReport(id: string) {
    await db.delete(qualityScore).where(eq(qualityScore.reportId, id));
    await db.delete(qualityValidation).where(eq(qualityValidation.reportId, id));
    await db.delete(qualityRecommendation).where(eq(qualityRecommendation.reportId, id));
    await db.delete(qualityRetryHistory).where(eq(qualityRetryHistory.reportId, id));
    await db.delete(qualityReport).where(eq(qualityReport.id, id));
  }

  async addScore(reportId: string, userId: string, data: { category: string; score: number; explanation?: string; weight?: number; details?: Record<string, unknown> }) {
    const id = generateId("qsc");
    return db.insert(qualityScore).values({ ...data, id, reportId, userId }).returning().then(r => r[0]);
  }

  async addValidation(reportId: string, userId: string, data: { validatorType: string; name: string; passed: boolean; severity?: string; message?: string; details?: Record<string, unknown> }) {
    const id = generateId("qval");
    return db.insert(qualityValidation).values({ ...data, id, reportId, userId }).returning().then(r => r[0]);
  }

  async addRecommendation(reportId: string, userId: string, data: { type: string; title: string; description?: string; severity?: string; impact?: number; action?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("qrec");
    return db.insert(qualityRecommendation).values({ ...data, id, reportId, userId }).returning().then(r => r[0]);
  }

  async addRetryHistory(reportId: string, userId: string, data: { assetId?: string; retryCount?: number; reason?: string; status?: string; provider?: string; model?: string; scoreBefore?: number; scoreAfter?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("qrt");
    return db.insert(qualityRetryHistory).values({ ...data, id, reportId, userId }).returning().then(r => r[0]);
  }

  async logAudit(userId: string, data: { action: string; reportId?: string; assetId?: string; details?: Record<string, unknown> }) {
    const id = generateId("quad");
    return db.insert(qualityAuditLog).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getStats(userId: string) {
    const conditions = [eq(qualityReport.userId, userId)];
    const [totalReports] = await db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(eq(qualityReport.userId, userId));
    const [passedReports] = await db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(and(eq(qualityReport.userId, userId), eq(qualityReport.passed, true)));
    const [failedReports] = await db.select({ count: sql<number>`count(*)` }).from(qualityReport).where(and(eq(qualityReport.userId, userId), eq(qualityReport.passed, false)));
    const [avgScore] = await db.select({ avg: sql<number>`coalesce(avg(${qualityReport.overallScore}), 0)` }).from(qualityReport).where(eq(qualityReport.userId, userId));
    const [totalValidations] = await db.select({ count: sql<number>`count(*)` }).from(qualityValidation).where(eq(qualityValidation.userId, userId));
    const [failedValidations] = await db.select({ count: sql<number>`count(*)` }).from(qualityValidation).where(and(eq(qualityValidation.userId, userId), eq(qualityValidation.passed, false)));
    const [totalRecommendations] = await db.select({ count: sql<number>`count(*)` }).from(qualityRecommendation).where(eq(qualityRecommendation.userId, userId));
    const [totalRetries] = await db.select({ count: sql<number>`count(*)` }).from(qualityRetryHistory).where(eq(qualityRetryHistory.userId, userId));
    const typeBreakdown = await db.select({ assetType: qualityReport.assetType, count: sql<number>`count(*)`, avgScore: sql<number>`avg(${qualityReport.overallScore})` }).from(qualityReport).where(eq(qualityReport.userId, userId)).groupBy(qualityReport.assetType);

    return {
      totalReports: Number(totalReports?.count ?? 0),
      passedReports: Number(passedReports?.count ?? 0),
      failedReports: Number(failedReports?.count ?? 0),
      avgOverallScore: Math.round(Number(avgScore?.avg ?? 0)),
      totalValidations: Number(totalValidations?.count ?? 0),
      failedValidations: Number(failedValidations?.count ?? 0),
      totalRecommendations: Number(totalRecommendations?.count ?? 0),
      totalRetries: Number(totalRetries?.count ?? 0),
      approvalRate: Number(totalReports?.count ?? 0) > 0 ? Math.round((Number(passedReports?.count ?? 0) / Number(totalReports?.count ?? 1)) * 100) : 0,
      typeBreakdown,
    };
  }
}

export const qualityReportService = new QualityReportService();
