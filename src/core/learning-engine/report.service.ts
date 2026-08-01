import { db } from "@/lib/db";
import { learningReport } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { learningCollectorService } from "./learning-collector.service";
import { patternAnalyzerService } from "./pattern-analyzer.service";
import { preferenceEngineService } from "./preference-engine.service";
import { recommendationEngineService } from "./recommendation-engine.service";
import { feedbackService } from "./feedback.service";
import { goalService } from "./goal.service";

export class ReportService {
  async generateReport(userId: string, reportType: string, period?: string) {
    const [eventStats, patternStats, prefStats, recStats, feedbackStats, goalStats] = await Promise.all([
      learningCollectorService.getStats(userId),
      patternAnalyzerService.getStats(userId),
      preferenceEngineService.getStats(userId),
      recommendationEngineService.getStats(userId),
      feedbackService.getStats(userId),
      goalService.getStats(userId),
    ]);

    const data = { eventStats, patternStats, prefStats, recStats, feedbackStats, goalStats };
    const summary = { totalEvents: eventStats.totalEvents, totalPatterns: patternStats.totalPatterns, totalPreferences: prefStats.totalPreferences, totalRecommendations: recStats.total, avgConfidence: patternStats.avgConfidence };

    const id = generateId("lrpt");
    return db.insert(learningReport).values({ id, userId, reportType, period, data, summary }).returning().then(r => r[0]);
  }

  async listReports(userId: string, filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningReport.userId, userId)];
    if (filters?.reportType) conditions.push(eq(learningReport.reportType, filters.reportType));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningReport).where(where).orderBy(desc(learningReport.generatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async deleteReport(id: string) {
    await db.delete(learningReport).where(eq(learningReport.id, id));
  }

  async getReport(id: string) {
    const [item] = await db.select().from(learningReport).where(eq(learningReport.id, id)).limit(1);
    return item || null;
  }
}

export const reportService = new ReportService();
