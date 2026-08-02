import { db } from "@/lib/db";
import { opsAuditEvent } from "@/lib/db/schema/operations";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AuditService {
  async logEvent(data: { userId?: string; action: string; category: string; entityType?: string; entityId?: string; details?: Record<string, unknown>; ipAddress?: string; userAgent?: string }) {
    const id = generateId("oadt");
    return db.insert(opsAuditEvent).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listEvents(filters?: { userId?: string; action?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(opsAuditEvent.userId, filters.userId));
    if (filters?.action) conditions.push(eq(opsAuditEvent.action, filters.action));
    if (filters?.category) conditions.push(eq(opsAuditEvent.category, filters.category));
    if (filters?.search) conditions.push(like(opsAuditEvent.action, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(opsAuditEvent).where(where).orderBy(desc(opsAuditEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(opsAuditEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(opsAuditEvent);
    const byCategory = await db.select({ category: opsAuditEvent.category, count: sql<number>`count(*)` }).from(opsAuditEvent).groupBy(opsAuditEvent.category);
    return { total: Number(total?.count ?? 0), byCategory };
  }
}

export const auditService = new AuditService();
