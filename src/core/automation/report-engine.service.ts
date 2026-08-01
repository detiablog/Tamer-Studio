import { db } from "@/lib/db";
import { automationReport, automationExecution, automationRule, automationEvent } from "@/lib/db/schema/automation";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ReportEngineService {
  async generateReport(userId: string, reportType: string, period?: string) {
    const stats = await this.getReportData(userId, reportType, period);

    const id = generateId("arep");
    return db.insert(automationReport).values({
      id,
      userId,
      reportType,
      period,
      data: stats.data,
      summary: stats.summary,
    }).returning().then(r => r[0]);
  }

  async listReports(userId: string, filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationReport.userId, userId)];
    if (filters?.reportType) conditions.push(eq(automationReport.reportType, filters.reportType));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationReport).where(where).orderBy(desc(automationReport.generatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getReport(id: string) {
    const [item] = await db.select().from(automationReport).where(eq(automationReport.id, id)).limit(1);
    return item || null;
  }

  async deleteReport(id: string) {
    await db.delete(automationReport).where(eq(automationReport.id, id));
  }

  private async getReportData(userId: string, reportType: string, period?: string) {
    const [totalExecutions] = await db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(eq(automationExecution.userId, userId));
    const [completedExecutions] = await db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(and(eq(automationExecution.userId, userId), eq(automationExecution.status, "completed")));
    const [failedExecutions] = await db.select({ count: sql<number>`count(*)` }).from(automationExecution).where(and(eq(automationExecution.userId, userId), eq(automationExecution.status, "failed")));
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${automationExecution.creditsUsed}), 0)` }).from(automationExecution).where(eq(automationExecution.userId, userId));
    const [totalRules] = await db.select({ count: sql<number>`count(*)` }).from(automationRule).where(eq(automationRule.userId, userId));
    const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(automationEvent).where(eq(automationEvent.userId, userId));

    const total = Number(totalExecutions?.count ?? 0);
    const completed = Number(completedExecutions?.count ?? 0);
    const failed = Number(failedExecutions?.count ?? 0);

    return {
      data: {
        totalExecutions: total,
        completedExecutions: completed,
        failedExecutions: failed,
        totalCreditsUsed: Number(totalCredits?.total ?? 0),
        totalRules: Number(totalRules?.count ?? 0),
        totalEvents: Number(totalEvents?.count ?? 0),
        period,
      },
      summary: {
        successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        failureRate: total > 0 ? Math.round((failed / total) * 100) : 0,
        averageCreditsPerExecution: total > 0 ? Math.round(Number(totalCredits?.total ?? 0) / total) : 0,
      },
    };
  }
}

export const reportEngineService = new ReportEngineService();
