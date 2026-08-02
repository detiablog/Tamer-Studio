import { db } from "@/lib/db";
import { secReport } from "@/lib/db/schema/security";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { threatDetectorService } from "./threat-detector.service";
import { secIncidentService } from "./incident.service";
import { sessionMonitorService } from "./session-monitor.service";
import { apiMonitorService } from "./api-monitor.service";
import { complianceService } from "./compliance.service";

export class SecurityReportService {
  async generateReport(reportType: string, title: string, period?: string) {
    const [threatStats, incidentStats, sessionStats, apiStats, complianceStats] = await Promise.all([
      threatDetectorService.getStats(),
      secIncidentService.getStats(),
      sessionMonitorService.getStats(),
      apiMonitorService.getStats(),
      complianceService.getStats(),
    ]);

    const data = { threatStats, incidentStats, sessionStats, apiStats, complianceStats };
    const summary = { totalThreats: threatStats.total, criticalThreats: threatStats.critical, openIncidents: incidentStats.open, activeSessions: sessionStats.active, suspiciousSessions: sessionStats.suspicious, totalApiCalls: apiStats.total, apiErrors: apiStats.errors, complianceScore: complianceStats.score };

    const id = generateId("srpt");
    return db.insert(secReport).values({ id, reportType, title, period, data, summary }).returning().then(r => r[0]);
  }

  async listReports(filters?: { reportType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.reportType) conditions.push(eq(secReport.reportType, filters.reportType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(secReport).where(where).orderBy(desc(secReport.generatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(secReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getReport(id: string) {
    const [item] = await db.select().from(secReport).where(eq(secReport.id, id)).limit(1);
    return item || null;
  }

  async deleteReport(id: string) {
    await db.delete(secReport).where(eq(secReport.id, id));
  }
}

export const securityReportService = new SecurityReportService();
