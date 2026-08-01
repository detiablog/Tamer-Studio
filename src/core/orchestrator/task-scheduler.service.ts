import { db } from "@/lib/db";
import { orchestratorTask } from "@/lib/db/schema/orchestrator";
import { eq, and, desc, count } from "drizzle-orm";

export class TaskSchedulerService {
  async listTasks(userId: string, options?: { page?: number; limit?: number; status?: string; executionId?: string }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(orchestratorTask.userId, userId)];
    if (options?.status) conditions.push(eq(orchestratorTask.status, options.status));
    if (options?.executionId) conditions.push(eq(orchestratorTask.executionId, options.executionId));

    const tasks = await db
      .select()
      .from(orchestratorTask)
      .where(and(...conditions))
      .orderBy(desc(orchestratorTask.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ value: count() })
      .from(orchestratorTask)
      .where(and(...conditions));

    return { tasks, total: totalResult[0]?.value || 0, page, limit };
  }

  async getTask(id: string) {
    const task = await db
      .select()
      .from(orchestratorTask)
      .where(eq(orchestratorTask.id, id))
      .limit(1);
    return task[0] || null;
  }

  async updateTask(id: string, data: {
    status?: string;
    priority?: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    progress?: number;
    scheduledAt?: Date;
    metadata?: Record<string, unknown>;
  }) {
    const [updated] = await db
      .update(orchestratorTask)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orchestratorTask.id, id))
      .returning();
    return updated || null;
  }

  async retryTask(id: string) {
    const task = await this.getTask(id);
    if (!task) return null;

    const [updated] = await db
      .update(orchestratorTask)
      .set({
        status: "pending",
        error: null,
        progress: 0,
        attempts: task.attempts + 1,
        startedAt: null,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(orchestratorTask.id, id))
      .returning();
    return updated || null;
  }

  async cancelTask(id: string) {
    const [updated] = await db
      .update(orchestratorTask)
      .set({ status: "cancelled", updatedAt: new Date(), completedAt: new Date() })
      .where(eq(orchestratorTask.id, id))
      .returning();
    return updated || null;
  }
}

export const taskSchedulerService = new TaskSchedulerService();
