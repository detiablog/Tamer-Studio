import { db } from "@/lib/db";
import { opsAlert } from "@/lib/db/schema/operations";
import { eq, and, desc, sql, like, count as sqlCount } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export class AlertService {
  async createAlert(data: { severity: AlertSeverity; category: string; title: string; message?: string; source?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("oalt");
    return db.insert(opsAlert).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listAlerts(filters?: { severity?: string; category?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.severity) conditions.push(eq(opsAlert.severity, filters.severity));
    if (filters?.category) conditions.push(eq(opsAlert.category, filters.category));
    if (filters?.status) conditions.push(eq(opsAlert.status, filters.status));
    if (filters?.search) conditions.push(like(opsAlert.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(opsAlert).where(where).orderBy(desc(opsAlert.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(opsAlert).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getAlert(id: string) {
    const [item] = await db.select().from(opsAlert).where(eq(opsAlert.id, id)).limit(1);
    return item || null;
  }

  async acknowledgeAlert(id: string, assignedTo?: string) {
    return db.update(opsAlert).set({ status: "acknowledged", acknowledgedAt: new Date(), assignedTo, updatedAt: new Date() }).where(eq(opsAlert.id, id)).returning().then(r => r[0]);
  }

  async resolveAlert(id: string) {
    return db.update(opsAlert).set({ status: "resolved", resolvedAt: new Date(), updatedAt: new Date() }).where(eq(opsAlert.id, id)).returning().then(r => r[0]);
  }

  async dismissAlert(id: string) {
    return db.update(opsAlert).set({ status: "dismissed", updatedAt: new Date() }).where(eq(opsAlert.id, id)).returning().then(r => r[0]);
  }

  async deleteAlert(id: string) {
    await db.delete(opsAlert).where(eq(opsAlert.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(opsAlert);
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(opsAlert).where(eq(opsAlert.status, "open"));
    const [critical] = await db.select({ count: sql<number>`count(*)` }).from(opsAlert).where(and(eq(opsAlert.status, "open"), eq(opsAlert.severity, "critical")));
    const [emergency] = await db.select({ count: sql<number>`count(*)` }).from(opsAlert).where(and(eq(opsAlert.status, "open"), eq(opsAlert.severity, "emergency")));
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), critical: Number(critical?.count ?? 0), emergency: Number(emergency?.count ?? 0) };
  }
}

export const alertService = new AlertService();
