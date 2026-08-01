import { db } from "@/lib/db";
import { orchestratorQueue, orchestratorTask } from "@/lib/db/schema/orchestrator";
import { eq, and, desc, count } from "drizzle-orm";

export class QueueManagerService {
  async listQueue(userId: string, options?: { page?: number; limit?: number; status?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(orchestratorQueue.userId, userId)];
    if (options?.status) conditions.push(eq(orchestratorQueue.status, options.status));

    const items = await db
      .select()
      .from(orchestratorQueue)
      .where(and(...conditions))
      .orderBy(orchestratorQueue.position)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ value: count() })
      .from(orchestratorQueue)
      .where(and(...conditions));

    return { items, total: totalResult[0]?.value || 0, page, limit };
  }

  async enqueue(userId: string, data: {
    taskId: string;
    priority?: string;
    estimatedCredits?: number;
    metadata?: Record<string, unknown>;
  }) {
    const maxPos = await db
      .select({ value: count() })
      .from(orchestratorQueue)
      .where(eq(orchestratorQueue.userId, userId));

    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorQueue)
      .values({
        id,
        userId,
        taskId: data.taskId,
        priority: data.priority || "normal",
        position: (maxPos[0]?.value || 0) + 1,
        estimatedCredits: data.estimatedCredits || 0,
        metadata: data.metadata || {},
      })
      .returning();
    return created;
  }

  async removeFromQueue(id: string) {
    await db.delete(orchestratorQueue).where(eq(orchestratorQueue.id, id));
  }

  async updatePriority(id: string, priority: string) {
    const [updated] = await db
      .update(orchestratorQueue)
      .set({ priority, updatedAt: new Date() })
      .where(eq(orchestratorQueue.id, id))
      .returning();
    return updated || null;
  }

  async getStats(userId: string) {
    const total = await db.select({ value: count() }).from(orchestratorQueue).where(eq(orchestratorQueue.userId, userId));
    const waiting = await db.select({ value: count() }).from(orchestratorQueue).where(and(eq(orchestratorQueue.userId, userId), eq(orchestratorQueue.status, "waiting")));
    const processing = await db.select({ value: count() }).from(orchestratorQueue).where(and(eq(orchestratorQueue.userId, userId), eq(orchestratorQueue.status, "processing")));

    return {
      total: total[0]?.value || 0,
      waiting: waiting[0]?.value || 0,
      processing: processing[0]?.value || 0,
    };
  }
}

export const queueManagerService = new QueueManagerService();
