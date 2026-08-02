import { db } from "@/lib/db";
import { scaleLoadTest } from "@/lib/db/schema/scaling";
import { eq, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class LoadTestService {
  async createTest(data: { testName: string; targetUsers: number; durationSeconds: number; metadata?: Record<string, unknown> }) {
    const id = generateId("sldt");
    return db.insert(scaleLoadTest).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listTests(filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      db.select().from(scaleLoadTest).orderBy(desc(scaleLoadTest.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(scaleLoadTest),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getTest(id: string) {
    const [item] = await db.select().from(scaleLoadTest).where(eq(scaleLoadTest.id, id)).limit(1);
    return item || null;
  }

  async startTest(id: string) {
    return db.update(scaleLoadTest).set({ status: "running", startedAt: new Date() }).where(eq(scaleLoadTest.id, id)).returning().then(r => r[0]);
  }

  async completeTest(id: string, results: Record<string, unknown>, summary: Record<string, unknown>) {
    return db.update(scaleLoadTest).set({ status: "completed", results, summary, completedAt: new Date() }).where(eq(scaleLoadTest.id, id)).returning().then(r => r[0]);
  }

  async failTest(id: string, error: string) {
    return db.update(scaleLoadTest).set({ status: "failed", results: { error }, completedAt: new Date() }).where(eq(scaleLoadTest.id, id)).returning().then(r => r[0]);
  }

  async deleteTest(id: string) {
    await db.delete(scaleLoadTest).where(eq(scaleLoadTest.id, id));
  }
}

export const loadTestService = new LoadTestService();
