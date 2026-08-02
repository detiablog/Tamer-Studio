import { db } from "@/lib/db";
import { obsLog } from "@/lib/db/schema/observability";
import { eq, and, desc, sql, like, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type LogSeverity = "debug" | "info" | "warn" | "error" | "fatal";

export class ObsLoggingService {
  async log(data: { correlationId?: string; requestId?: string; severity?: LogSeverity; service?: string; module?: string; message: string; data?: Record<string, unknown>; userId?: string; projectId?: string; durationMs?: number; environment?: string }) {
    const id = generateId("obsl");
    return db.insert(obsLog).values({ ...data, id }).returning().then(r => r[0]);
  }

  async list(filters?: { severity?: string; service?: string; module?: string; correlationId?: string; search?: string; startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 100, 500);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.severity) conditions.push(eq(obsLog.severity, filters.severity));
    if (filters?.service) conditions.push(eq(obsLog.service, filters.service));
    if (filters?.module) conditions.push(eq(obsLog.module, filters.module));
    if (filters?.correlationId) conditions.push(eq(obsLog.correlationId, filters.correlationId));
    if (filters?.search) conditions.push(like(obsLog.message, `%${filters.search}%`));
    if (filters?.startDate) conditions.push(gte(obsLog.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(sql`${obsLog.createdAt} <= ${filters.endDate}`);
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(obsLog).where(where).orderBy(desc(obsLog.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(obsLog).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getByCorrelationId(correlationId: string) {
    return db.select().from(obsLog).where(eq(obsLog.correlationId, correlationId)).orderBy(obsLog.createdAt);
  }

  async cleanup(retentionDays = 30) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return db.delete(obsLog).where(lte(obsLog.createdAt, cutoff));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(obsLog);
    const bySeverity = await db.select({ severity: obsLog.severity, count: sql<number>`count(*)` }).from(obsLog).groupBy(obsLog.severity);
    const byService = await db.select({ service: obsLog.service, count: sql<number>`count(*)` }).from(obsLog).groupBy(obsLog.service);
    return { total: Number(total?.count ?? 0), bySeverity, byService };
  }
}

export const obsLoggingService = new ObsLoggingService();
