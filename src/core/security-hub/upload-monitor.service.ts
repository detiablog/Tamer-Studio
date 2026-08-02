import { db } from "@/lib/db";
import { secUploadEvent } from "@/lib/db/schema/security";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class UploadMonitorService {
  async recordUpload(data: { userId: string; filename: string; mimeType?: string; fileSize?: number; storagePath?: string; isValid?: boolean; isSuspicious?: boolean; validationErrors?: string[]; ipAddress?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("supl");
    return db.insert(secUploadEvent).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listUploads(filters?: { userId?: string; isValid?: boolean; isSuspicious?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(secUploadEvent.userId, filters.userId));
    if (filters?.isValid !== undefined) conditions.push(eq(secUploadEvent.isValid, filters.isValid));
    if (filters?.isSuspicious !== undefined) conditions.push(eq(secUploadEvent.isSuspicious, filters.isSuspicious));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(secUploadEvent).where(where).orderBy(desc(secUploadEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(secUploadEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(secUploadEvent);
    const [invalid] = await db.select({ count: sql<number>`count(*)` }).from(secUploadEvent).where(eq(secUploadEvent.isValid, false));
    const [suspicious] = await db.select({ count: sql<number>`count(*)` }).from(secUploadEvent).where(eq(secUploadEvent.isSuspicious, true));
    return { total: Number(total?.count ?? 0), invalid: Number(invalid?.count ?? 0), suspicious: Number(suspicious?.count ?? 0) };
  }
}

export const uploadMonitorService = new UploadMonitorService();
