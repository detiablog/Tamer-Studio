import { db } from "@/lib/db";
import { biReport, biReportTemplate, biSchedule, biKpi, biExport } from "@/lib/db/schema/bi";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { cacheGetOrSet } from "@/lib/cache";

export class BIEngine {
  async listReports(filters?: { type?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.type) conditions.push(eq(biReport.type, filters.type));
    if (filters?.category) conditions.push(eq(biReport.category, filters.category));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(biReport).where(where).orderBy(desc(biReport.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(biReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createReport(data: { name: string; type: string; category: string; description?: string; config?: Record<string, unknown>; createdBy?: string }) {
    const id = generateId("rpt");
    return db.insert(biReport).values({ ...data, id, config: data.config || {} }).returning().then(r => r[0]);
  }

  async updateReport(id: string, data: Record<string, unknown>) {
    return db.update(biReport).set({ ...data, updatedAt: new Date() }).where(eq(biReport.id, id)).returning().then(r => r[0]);
  }

  async getReport(id: string) {
    const [report] = await db.select().from(biReport).where(eq(biReport.id, id)).limit(1);
    return report;
  }

  async listTemplates(category?: string) {
    const where = category ? eq(biReportTemplate.category, category) : undefined;
    return db.select().from(biReportTemplate).where(where).orderBy(biReportTemplate.name);
  }

  async createTemplate(data: { name: string; description?: string; category: string; config: Record<string, unknown>; isSystem?: boolean }) {
    const id = generateId("rptpl");
    return db.insert(biReportTemplate).values({ ...data, id, isSystem: data.isSystem || false }).returning().then(r => r[0]);
  }

  async listSchedules() {
    return db.select().from(biSchedule).orderBy(desc(biSchedule.createdAt));
  }

  async createSchedule(data: { name: string; reportTemplateId?: string; scheduleType: string; config?: Record<string, unknown>; recipients?: string[]; format?: string; timezone?: string; createdBy?: string }) {
    const id = generateId("sch");
    return db.insert(biSchedule).values({ ...data, id, config: data.config || {}, recipients: data.recipients || [] }).returning().then(r => r[0]);
  }

  async updateSchedule(id: string, data: Record<string, unknown>) {
    return db.update(biSchedule).set({ ...data, updatedAt: new Date() }).where(eq(biSchedule.id, id)).returning().then(r => r[0]);
  }

  async listKpis(category?: string) {
    const where = category ? eq(biKpi.category, category) : undefined;
    return db.select().from(biKpi).where(where).orderBy(biKpi.name);
  }

  async createKpi(data: { name: string; category: string; currentValue?: string; targetValue?: string; unit?: string; owner?: string }) {
    const id = generateId("kpi");
    return db.insert(biKpi).values({ ...data, id, currentValue: data.currentValue || "0", targetValue: data.targetValue || "0" }).returning().then(r => r[0]);
  }

  async updateKpi(id: string, data: Record<string, unknown>) {
    return db.update(biKpi).set({ ...data, updatedAt: new Date() }).where(eq(biKpi.id, id)).returning().then(r => r[0]);
  }

  async createExport(data: { name: string; reportId?: string; format: string; requestedBy?: string }) {
    const id = generateId("exp");
    return db.insert(biExport).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listExports() {
    return db.select().from(biExport).orderBy(desc(biExport.createdAt)).limit(50);
  }

  async getExecutiveDashboard() {
    return cacheGetOrSet("bi:dashboard:executive", async () => {
      const [totalReports] = await db.select({ count: sql<number>`count(*)` }).from(biReport);
      const [totalKpis] = await db.select({ count: sql<number>`count(*)` }).from(biKpi);
      const [activeSchedules] = await db.select({ count: sql<number>`count(*)` }).from(biSchedule).where(eq(biSchedule.isActive, true));
      const [totalExports] = await db.select({ count: sql<number>`count(*)` }).from(biExport);
      const kpis = await db.select().from(biKpi);
      return {
        totalReports: Number(totalReports?.count ?? 0),
        totalKpis: Number(totalKpis?.count ?? 0),
        activeSchedules: Number(activeSchedules?.count ?? 0),
        totalExports: Number(totalExports?.count ?? 0),
        kpis,
      };
    }, 30000);
  }
}

export const biEngine = new BIEngine();
