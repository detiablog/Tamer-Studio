import { db } from "@/lib/db";
import { opsReport } from "@/lib/db/schema/operations";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { alertService } from "./alert.service";
import { incidentService } from "./incident.service";
import { opsHealthService } from "./health.service";

export class OpsReportService {
  async generateReport(reportType: string, title: string, period?: string, generatedBy?: string) {
    const [alertStats, incidentStats, health] = await Promise.all([
      alertService.getStats(),
      incidentService.getStats(),
      opsHealthService.getOverallStatus(),
    ]);

    const data = { alertStats, incidentStats, health };
    const summary = {
      totalAlerts: alertStats.total,
      openAlerts: alertStats.open,
      criticalAlerts: alertStats.critical,
      totalIncidents: incidentStats.total,
      openIncidents: incidentStats.open,
      systemStatus: health.status,
    };

    const id = generateId("orp");
    return db.insert(opsReport).values({ id, reportType, title, period, data, summary, generatedBy }).returning().then(r => r[0]);
  }

  async listReports(filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.reportType) conditions.push(eq(opsReport.reportType, filters.reportType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(opsReport).where(where).orderBy(desc(opsReport.generatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(opsReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getReport(id: string) {
    const [item] = await db.select().from(opsReport).where(eq(opsReport.id, id)).limit(1);
    return item || null;
  }

  async deleteReport(id: string) {
    await db.delete(opsReport).where(eq(opsReport.id, id));
  }
}

export const opsReportService = new OpsReportService();
