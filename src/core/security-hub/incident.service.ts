import { db } from "@/lib/db";
import { secIncident } from "@/lib/db/schema/security";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class SecIncidentService {
  async createIncident(data: { title: string; description?: string; severity?: string; category: string; affectedSystems?: string[]; eventIds?: string[]; impact?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("sinc");
    return db.insert(secIncident).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listIncidents(filters?: { severity?: string; status?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.severity) conditions.push(eq(secIncident.severity, filters.severity));
    if (filters?.status) conditions.push(eq(secIncident.status, filters.status));
    if (filters?.category) conditions.push(eq(secIncident.category, filters.category));
    if (filters?.search) conditions.push(like(secIncident.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(secIncident).where(where).orderBy(desc(secIncident.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(secIncident).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getIncident(id: string) {
    const [item] = await db.select().from(secIncident).where(eq(secIncident.id, id)).limit(1);
    return item || null;
  }

  async updateIncident(id: string, data: Record<string, unknown>) {
    return db.update(secIncident).set(data).where(eq(secIncident.id, id)).returning().then(r => r[0]);
  }

  async resolveIncident(id: string, resolution: string, resolvedBy?: string) {
    return db.update(secIncident).set({ status: "resolved", resolution, resolvedAt: new Date(), updatedAt: new Date() }).where(eq(secIncident.id, id)).returning().then(r => r[0]);
  }

  async deleteIncident(id: string) {
    await db.delete(secIncident).where(eq(secIncident.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(secIncident);
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(secIncident).where(eq(secIncident.status, "open"));
    const [critical] = await db.select({ count: sql<number>`count(*)` }).from(secIncident).where(and(eq(secIncident.status, "open"), eq(secIncident.severity, "critical")));
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), critical: Number(critical?.count ?? 0) };
  }
}

export const secIncidentService = new SecIncidentService();
