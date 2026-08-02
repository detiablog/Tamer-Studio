import { db } from "@/lib/db";
import { obsAlert } from "@/lib/db/schema/observability";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ObsAlertService {
  async create(data: { ruleName: string; severity?: string; category: string; title: string; message?: string; status?: string; correlationId?: string; service?: string; metricName?: string; metricValue?: number; threshold?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("obsa");
    return db.insert(obsAlert).values({ ...data, id }).returning().then(r => r[0]);
  }

  async list(filters?: { severity?: string; status?: string; service?: string; startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 100, 500);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.severity) conditions.push(eq(obsAlert.severity, filters.severity));
    if (filters?.status) conditions.push(eq(obsAlert.status, filters.status));
    if (filters?.service) conditions.push(eq(obsAlert.service, filters.service));
    if (filters?.startDate) conditions.push(gte(obsAlert.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(obsAlert.createdAt, filters.endDate));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(obsAlert).where(where).orderBy(desc(obsAlert.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(obsAlert).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getById(id: string) {
    return db.select().from(obsAlert).where(eq(obsAlert.id, id)).then(r => r[0] ?? null);
  }

  async acknowledge(id: string) {
    return db.update(obsAlert).set({ acknowledgedAt: new Date(), status: "acknowledged" }).where(eq(obsAlert.id, id)).returning().then(r => r[0]);
  }

  async resolve(id: string) {
    return db.update(obsAlert).set({ resolvedAt: new Date(), status: "resolved" }).where(eq(obsAlert.id, id)).returning().then(r => r[0]);
  }

  async delete(id: string) {
    return db.delete(obsAlert).where(eq(obsAlert.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(obsAlert);
    const firing = await db.select({ count: sql<number>`count(*)` }).from(obsAlert).where(eq(obsAlert.status, "firing"));
    const bySeverity = await db.select({ severity: obsAlert.severity, count: sql<number>`count(*)` }).from(obsAlert).groupBy(obsAlert.severity);
    return { total: Number(total?.count ?? 0), firing: Number(firing[0]?.count ?? 0), bySeverity };
  }
}

export const obsAlertService = new ObsAlertService();
