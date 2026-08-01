import { db } from "@/lib/db";
import { aiQueueItem } from "@/lib/db/schema/ai-gateway";
import { eq, and, desc, sql, count, inArray, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class QueueManagerService {
  async enqueue(data: { userId?: string; requestId: string; priority?: string; capability?: string; provider?: string; model?: string; estimatedCredits?: number; scheduledAt?: Date }) {
    const [maxPos] = await db.select({ pos: sql<number>`coalesce(max(${aiQueueItem.position}), 0)` }).from(aiQueueItem).where(data.userId ? eq(aiQueueItem.userId, data.userId) : undefined);
    const id = generateId("aqi");
    return db.insert(aiQueueItem).values({ ...data, id, position: (maxPos?.pos || 0) + 1 }).returning().then(r => r[0]);
  }

  async dequeue() {
    const now = new Date();
    const [item] = await db.select().from(aiQueueItem).where(and(eq(aiQueueItem.status, "waiting"), sql`(${aiQueueItem.scheduledAt} IS NULL OR ${aiQueueItem.scheduledAt} <= ${now})`)).orderBy(sql`CASE ${aiQueueItem.priority} WHEN 'high' THEN 0 WHEN 'normal' THEN 1 WHEN 'low' THEN 2 END`, aiQueueItem.position).limit(1);
    if (!item) return null;
    await db.update(aiQueueItem).set({ status: "running", startedAt: new Date() }).where(eq(aiQueueItem.id, item.id));
    return item;
  }

  async ack(queueId: string) {
    return db.update(aiQueueItem).set({ status: "completed", completedAt: new Date() }).where(eq(aiQueueItem.id, queueId)).returning().then(r => r[0]);
  }

  async nack(queueId: string) {
    return db.update(aiQueueItem).set({ status: "failed", completedAt: new Date() }).where(eq(aiQueueItem.id, queueId)).returning().then(r => r[0]);
  }

  async cancel(queueId: string) {
    return db.update(aiQueueItem).set({ status: "cancelled", completedAt: new Date() }).where(eq(aiQueueItem.id, queueId)).returning().then(r => r[0]);
  }

  async retry(queueId: string) {
    return db.update(aiQueueItem).set({ status: "waiting", startedAt: null, completedAt: null }).where(eq(aiQueueItem.id, queueId)).returning().then(r => r[0]);
  }

  async removeFromQueue(queueId: string) {
    await db.delete(aiQueueItem).where(eq(aiQueueItem.id, queueId));
  }

  async listQueue(filters?: { status?: string; userId?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(aiQueueItem.status, filters.status));
    if (filters?.userId) conditions.push(eq(aiQueueItem.userId, filters.userId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(aiQueueItem).where(where).orderBy(aiQueueItem.position).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(aiQueueItem).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getQueueStatus() {
    const [waiting] = await db.select({ count: count() }).from(aiQueueItem).where(eq(aiQueueItem.status, "waiting"));
    const [running] = await db.select({ count: count() }).from(aiQueueItem).where(eq(aiQueueItem.status, "running"));
    const [completed] = await db.select({ count: count() }).from(aiQueueItem).where(eq(aiQueueItem.status, "completed"));
    const [failed] = await db.select({ count: count() }).from(aiQueueItem).where(eq(aiQueueItem.status, "failed"));
    const [totalCredits] = await db.select({ total: sql<number>`coalesce(sum(${aiQueueItem.estimatedCredits}), 0)` }).from(aiQueueItem).where(inArray(aiQueueItem.status, ["waiting", "running"]));

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
    return db.update(aiQueueItem).set({ priority }).where(eq(aiQueueItem.id, queueId)).returning().then(r => r[0]);
  }

  async clearQueue(status?: string) {
    const conditions = status ? [eq(aiQueueItem.status, status)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    await db.delete(aiQueueItem).where(where);
  }
}

export const queueManagerService = new QueueManagerService();
