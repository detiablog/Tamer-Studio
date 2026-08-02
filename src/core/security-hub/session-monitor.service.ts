import { db } from "@/lib/db";
import { secSession } from "@/lib/db/schema/security";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class SessionMonitorService {
  async trackSession(data: { userId: string; ipAddress?: string; userAgent?: string; device?: string; location?: string }) {
    const existing = await db.select().from(secSession).where(and(eq(secSession.isActive, true), eq(secSession.userId, data.userId), data.userAgent ? eq(secSession.userAgent, data.userAgent) : undefined)).limit(1);
    if (existing.length > 0) {
      return db.update(secSession).set({ lastActivityAt: new Date() }).where(eq(secSession.id, existing[0].id)).returning().then(r => r[0]);
    }
    const id = generateId("sses");
    return db.insert(secSession).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listActiveSessions(userId?: string) {
    const conditions = [eq(secSession.isActive, true)];
    if (userId) conditions.push(eq(secSession.userId, userId));
    return db.select().from(secSession).where(and(...conditions)).orderBy(desc(secSession.lastActivityAt));
  }

  async revokeSession(id: string) {
    return db.update(secSession).set({ isActive: false }).where(eq(secSession.id, id)).returning().then(r => r[0]);
  }

  async revokeAllUserSessions(userId: string) {
    return db.update(secSession).set({ isActive: false }).where(and(eq(secSession.userId, userId), eq(secSession.isActive, true)));
  }

  async markSuspicious(id: string, riskScore: number) {
    return db.update(secSession).set({ isSuspicious: true, riskScore }).where(eq(secSession.id, id)).returning().then(r => r[0]);
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(secSession);
    const [active] = await db.select({ count: sql<number>`count(*)` }).from(secSession).where(eq(secSession.isActive, true));
    const [suspicious] = await db.select({ count: sql<number>`count(*)` }).from(secSession).where(eq(secSession.isSuspicious, true));
    return { total: Number(total?.count ?? 0), active: Number(active?.count ?? 0), suspicious: Number(suspicious?.count ?? 0) };
  }
}

export const sessionMonitorService = new SessionMonitorService();
