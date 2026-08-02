import { db } from "@/lib/db";
import { scalePerformanceReport } from "@/lib/db/schema/scaling";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { scaleMetricsService } from "./metrics.service";
import { workerMetricsService } from "./worker-metrics.service";
import { queueMetricsService } from "./queue-metrics.service";

export class PerformanceService {
  async generateReport(reportType: string, title: string, period?: string) {
    const [workerStats, queueStats, metricSummary] = await Promise.all([
      workerMetricsService.getWorkerStats(),
      queueMetricsService.getQueueStats(),
      scaleMetricsService.summary(24),
    ]);

    const data = { workerStats, queueStats, metricSummary };
    const summary = { activeWorkers: workerStats.active, totalWorkers: workerStats.total, avgCpu: workerStats.avgCpu, avgMemory: workerStats.avgMemory, totalJobs: workerStats.totalJobs, totalBacklog: queueStats.totalBacklog };

    const id = generateId("spr");
    return db.insert(scalePerformanceReport).values({ id, reportType, title, period, data, summary }).returning().then(r => r[0]);
  }

  async listReports(filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.reportType) conditions.push(eq(scalePerformanceReport.reportType, filters.reportType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(scalePerformanceReport).where(where).orderBy(desc(scalePerformanceReport.generatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(scalePerformanceReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getReport(id: string) {
    const [item] = await db.select().from(scalePerformanceReport).where(eq(scalePerformanceReport.id, id)).limit(1);
    return item || null;
  }

  async deleteReport(id: string) {
    await db.delete(scalePerformanceReport).where(eq(scalePerformanceReport.id, id));
  }
}

export const performanceService = new PerformanceService();
