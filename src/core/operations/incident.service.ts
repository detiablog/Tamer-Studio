import { db } from "@/lib/db";
import { opsIncident } from "@/lib/db/schema/operations";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class IncidentService {
  async createIncident(data: { title: string; description?: string; severity?: string; category: string; affectedServices?: string[]; impact?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("oinc");
    return db.insert(opsIncident).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listIncidents(filters?: { severity?: string; status?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.severity) conditions.push(eq(opsIncident.severity, filters.severity));
    if (filters?.status) conditions.push(eq(opsIncident.status, filters.status));
    if (filters?.category) conditions.push(eq(opsIncident.category, filters.category));
    if (filters?.search) conditions.push(like(opsIncident.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(opsIncident).where(where).orderBy(desc(opsIncident.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(opsIncident).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getIncident(id: string) {
    const [item] = await db.select().from(opsIncident).where(eq(opsIncident.id, id)).limit(1);
    return item || null;
  }

  async updateIncident(id: string, data: Record<string, unknown>) {
    return db.update(opsIncident).set(data).where(eq(opsIncident.id, id)).returning().then(r => r[0]);
  }

  async resolveIncident(id: string, resolution: string) {
    return db.update(opsIncident).set({ status: "resolved", resolution, resolvedAt: new Date(), updatedAt: new Date() }).where(eq(opsIncident.id, id)).returning().then(r => r[0]);
  }

  async deleteIncident(id: string) {
    await db.delete(opsIncident).where(eq(opsIncident.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(opsIncident);
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(opsIncident).where(eq(opsIncident.status, "open"));
    const [resolved] = await db.select({ count: sql<number>`count(*)` }).from(opsIncident).where(eq(opsIncident.status, "resolved"));
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), resolved: Number(resolved?.count ?? 0) };
  }
}

export const incidentService = new IncidentService();
