import { db } from "@/lib/db";
import { scaleCapacityForecast, scaleResourceLimit } from "@/lib/db/schema/scaling";
import { eq, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class CapacityService {
  async listForecasts(filters?: { forecastType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      db.select().from(scaleCapacityForecast).orderBy(desc(scaleCapacityForecast.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(scaleCapacityForecast),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async generateForecast(data: { forecastType: string; currentValue: number; projectedValue: number; projectedDate: Date; confidence?: number; recommendation?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("scf");
    return db.insert(scaleCapacityForecast).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listResourceLimits(filters?: { resourceType?: string }) {
    const conditions = [];
    if (filters?.resourceType) conditions.push(eq(scaleResourceLimit.resourceType, filters.resourceType));
    const where = conditions.length > 0 ? sql`${conditions[0]}` : undefined;
    return db.select().from(scaleResourceLimit).where(where).orderBy(scaleResourceLimit.resourceType);
  }

  async upsertResourceLimit(data: { resourceType: string; resourceName: string; limitType: string; limitValue: number; currentValue?: number; unit?: string; isEnabled?: boolean; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(scaleResourceLimit).where(eq(scaleResourceLimit.resourceName, data.resourceName)).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(scaleResourceLimit).set({ ...data, updatedAt: new Date() }).where(eq(scaleResourceLimit.id, existing[0].id)).returning();
      return updated;
    }
    const id = generateId("srl");
    const [created] = await db.insert(scaleResourceLimit).values({ ...data, id }).returning();
    return created;
  }

  async deleteResourceLimit(id: string) {
    await db.delete(scaleResourceLimit).where(eq(scaleResourceLimit.id, id));
  }
}

export const capacityService = new CapacityService();
