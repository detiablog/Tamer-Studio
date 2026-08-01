import { db } from "@/lib/db";
import { automationQueue, automationExecution } from "@/lib/db/schema/automation";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class QueueEngineService {
  async enqueue(executionId: string, userId: string, priority = "normal", scheduledAt?: Date, estimatedCredits = 0) {
    const [maxPos] = await db.select({ pos: sql<number>`coalesce(max(${automationQueue.position}), 0)` })
      .from(automationQueue)
      .where(eq(automationQueue.userId, userId));

    const id = generateId("aque");
    return db.insert(automationQueue).values({
      id,
      userId,
      executionId,
      priority,
      position: (maxPos?.pos || 0) + 1,
      scheduledAt,
      estimatedCredits,
    }).returning().then(r => r[0]);
  }

  async dequeue(userId: string) {
    const now = new Date();
    const [item] = await db.select().from(automationQueue)
      .where(and(
        eq(automationQueue.userId, userId),
        eq(automationQueue.status, "waiting"),
        sql`(${automationQueue.scheduledAt} IS NULL OR ${automationQueue.scheduledAt} <= ${now})`
      ))
      .orderBy(
        sql`CASE ${automationQueue.priority} WHEN 'high' THEN 0 WHEN 'normal' THEN 1 WHEN 'low' THEN 2 END`,
        automationQueue.position
      )
      .limit(1);

    if (!item) return null;

    await db.update(automationQueue).set({ status: "running", startedAt: new Date() }).where(eq(automationQueue.id, item.id));
    return item;
  }

  async ack(queueId: string) {
    return db.update(automationQueue).set({ status: "completed", completedAt: new Date() }).where(eq(automationQueue.id, queueId)).returning().then(r => r[0]);
  }

  async nack(queueId: string) {
    return db.update(automationQueue).set({ status: "failed", completedAt: new Date() }).where(eq(automationQueue.id, queueId)).returning().then(r => r[0]);
  }

  async retry(queueId: string) {
    return db.update(automationQueue).set({ status: "waiting", startedAt: null, completedAt: null }).where(eq(automationQueue.id, queueId)).returning().then(r => r[0]);
  }

  async cancel(queueId: string) {
    return db.update(automationQueue).set({ status: "cancelled", completedAt: new Date() }).where(eq(automationQueue.id, queueId)).returning().then(r => r[0]);
  }

  async removeFromQueue(queueId: string) {
    await db.delete(automationQueue).where(eq(automationQueue.id, queueId));
  }

  async listQueue(userId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationQueue.userId, userId)];
    if (filters?.status) conditions.push(eq(automationQueue.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationQueue).where(where).orderBy(automationQueue.position).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationQueue).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getQueueStatus(userId: string) {
    const [waiting] = await db.select({ count: count() }).from(automationQueue).where(and(eq(automationQueue.userId, userId), eq(automationQueue.status, "waiting")));
    const [running] = await db.select({ count: count() }).from(automationQueue).where(and(eq(automationQueue.userId, userId), eq(automationQueue.status, "running")));
    const [completed] = await db.select({ count: count() }).from(automationQueue).where(and(eq(automationQueue.userId, userId), eq(automationQueue.status, "completed")));
    const [failed] = await db.select({ count: count() }).from(automationQueue).where(and(eq(automationQueue.userId, userId), eq(automationQueue.status, "failed")));
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${automationQueue.estimatedCredits}), 0)` }).from(automationQueue).where(and(eq(automationQueue.userId, userId), inArray(automationQueue.status, ["waiting", "running"])));

    return {
      waiting: Number(waiting?.count ?? 0),
      running: Number(running?.count ?? 0),
      completed: Number(completed?.count ?? 0),
      failed: Number(failed?.count ?? 0),
      total: Number(waiting?.count ?? 0) + Number(running?.count ?? 0),
      estimatedCredits: Number(totalCredits?.total ?? 0),
    };
  }

  async reprioritize(queueId: string, priority: string) {
    return db.update(automationQueue).set({ priority }).where(eq(automationQueue.id, queueId)).returning().then(r => r[0]);
  }

  async clearQueue(userId: string, status?: string) {
    const conditions = [eq(automationQueue.userId, userId)];
    if (status) conditions.push(eq(automationQueue.status, status));
    await db.delete(automationQueue).where(and(...conditions));
  }
}

export const queueEngineService = new QueueEngineService();
