import { db } from "@/lib/db";
import { obsError } from "@/lib/db/schema/observability";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ObsErrorService {
  async record(data: { correlationId?: string; severity?: string; type: string; message: string; stackTrace?: string; service?: string; module?: string; endpoint?: string; method?: string; statusCode?: number; userId?: string; environment?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("obse");
    return db.insert(obsError).values({ ...data, id }).returning().then(r => r[0]);
  }

  async list(filters?: { severity?: string; service?: string; type?: string; resolved?: boolean; startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 100, 500);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.severity) conditions.push(eq(obsError.severity, filters.severity));
    if (filters?.service) conditions.push(eq(obsError.service, filters.service));
    if (filters?.type) conditions.push(eq(obsError.type, filters.type));
    if (filters?.resolved !== undefined) conditions.push(eq(obsError.resolved, filters.resolved));
    if (filters?.startDate) conditions.push(gte(obsError.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(obsError.createdAt, filters.endDate));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(obsError).where(where).orderBy(desc(obsError.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(obsError).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getById(id: string) {
    return db.select().from(obsError).where(eq(obsError.id, id)).then(r => r[0] ?? null);
  }

  async resolve(id: string, resolution?: string) {
    return db.update(obsError).set({ resolved: true, resolvedAt: new Date(), resolution }).where(eq(obsError.id, id)).returning().then(r => r[0]);
  }

  async delete(id: string) {
    return db.delete(obsError).where(eq(obsError.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(obsError);
    const unresolved = await db.select({ count: sql<number>`count(*)` }).from(obsError).where(eq(obsError.resolved, false));
    const bySeverity = await db.select({ severity: obsError.severity, count: sql<number>`count(*)` }).from(obsError).groupBy(obsError.severity);
    const byService = await db.select({ service: obsError.service, count: sql<number>`count(*)` }).from(obsError).groupBy(obsError.service);
    return { total: Number(total?.count ?? 0), unresolved: Number(unresolved[0]?.count ?? 0), bySeverity, byService };
  }

  async cleanup(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(obsError).where(lte(obsError.createdAt, cutoff));
  }
}

export const obsErrorService = new ObsErrorService();
