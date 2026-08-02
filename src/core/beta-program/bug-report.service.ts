import { db } from "@/lib/db";
import { betaBugReport, betaUser } from "@/lib/db/schema/beta";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class BugReportService {
  async submitBug(userId: string, data: { title: string; description: string; reproductionSteps?: string; severity?: string; priority?: string; category?: string; browser?: string; os?: string; screenSize?: string; version?: string; buildNumber?: string; traceId?: string; correlationId?: string; screenshots?: string[]; attachments?: string[]; consoleLogs?: string; environment?: Record<string, unknown> }) {
    const id = generateId("bbug");
    await db.update(betaUser).set({ bugCount: sql`${betaUser.bugCount} + 1` }).where(eq(betaUser.userId, userId));
    return db.insert(betaBugReport).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listBugs(filters?: { userId?: string; status?: string; severity?: string; priority?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(betaBugReport.userId, filters.userId));
    if (filters?.status) conditions.push(eq(betaBugReport.status, filters.status));
    if (filters?.severity) conditions.push(eq(betaBugReport.severity, filters.severity));
    if (filters?.priority) conditions.push(eq(betaBugReport.priority, filters.priority));
    if (filters?.search) conditions.push(like(betaBugReport.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaBugReport).where(where).orderBy(desc(betaBugReport.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaBugReport).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getBug(id: string) {
    const [item] = await db.select().from(betaBugReport).where(eq(betaBugReport.id, id)).limit(1);
    return item || null;
  }

  async updateBug(id: string, data: Record<string, unknown>) {
    return db.update(betaBugReport).set(data).where(eq(betaBugReport.id, id)).returning().then(r => r[0]);
  }

  async resolveBug(id: string, resolution: string) {
    return db.update(betaBugReport).set({ status: "resolved", resolution, resolvedAt: new Date() }).where(eq(betaBugReport.id, id)).returning().then(r => r[0]);
  }

  async voteBug(id: string) {
    return db.update(betaBugReport).set({ votes: sql`${betaBugReport.votes} + 1` }).where(eq(betaBugReport.id, id)).returning().then(r => r[0]);
  }

  async deleteBug(id: string) {
    await db.delete(betaBugReport).where(eq(betaBugReport.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(betaBugReport);
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(betaBugReport).where(eq(betaBugReport.status, "open"));
    const [critical] = await db.select({ count: sql<number>`count(*)` }).from(betaBugReport).where(and(eq(betaBugReport.status, "open"), eq(betaBugReport.severity, "critical")));
    const bySeverity = await db.select({ severity: betaBugReport.severity, count: sql<number>`count(*)` }).from(betaBugReport).groupBy(betaBugReport.severity);
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), critical: Number(critical?.count ?? 0), bySeverity };
  }
}

export const bugReportService = new BugReportService();
