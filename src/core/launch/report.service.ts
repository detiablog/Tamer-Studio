import { db } from "@/lib/db";
import { launchReport } from "@/lib/db/schema/launch";
import { eq, desc, sql, and } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class LaunchReportService {
  async generateReport(reportType: string, title: string, data: Record<string, unknown>) {
    const id = generateId("lrpt");
    const summary = {
      type: reportType,
      generatedAt: new Date().toISOString(),
    };
    return db.insert(launchReport).values({ id, reportType, title, data, summary }).returning().then(r => r[0]);
  }

  async listReports(filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.reportType) conditions.push(eq(launchReport.reportType, filters.reportType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(launchReport).where(where).orderBy(desc(launchReport.generatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(launchReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getReport(id: string) {
    const [item] = await db.select().from(launchReport).where(eq(launchReport.id, id)).limit(1);
    return item || null;
  }

  async deleteReport(id: string) {
    await db.delete(launchReport).where(eq(launchReport.id, id));
  }
}

export const launchReportService = new LaunchReportService();
