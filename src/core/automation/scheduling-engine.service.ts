import { db } from "@/lib/db";
import { automationSchedule, automationRule, automationExecution } from "@/lib/db/schema/automation";
import { eq, and, desc, sql, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type ScheduleType = "once" | "daily" | "weekly" | "monthly" | "yearly" | "interval" | "cron";

export class SchedulingEngineService {
  async listSchedules(userId: string, filters?: { isActive?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(automationSchedule.userId, userId)];
    if (filters?.isActive !== undefined) conditions.push(eq(automationSchedule.isActive, filters.isActive));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(automationSchedule).where(where).orderBy(desc(automationSchedule.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(automationSchedule).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createSchedule(userId: string, data: { ruleId?: string; name: string; type: ScheduleType; cronExpression?: string; intervalMs?: number; startTime?: Date; endTime?: Date; timezone?: string; maxRuns?: number }) {
    const id = generateId("asched");
    const nextRunAt = this.calculateNextRun(data.type, data.intervalMs, data.cronExpression);
    return db.insert(automationSchedule).values({ ...data, id, userId, nextRunAt }).returning().then(r => r[0]);
  }

  async getSchedule(id: string) {
    const [item] = await db.select().from(automationSchedule).where(eq(automationSchedule.id, id)).limit(1);
    return item || null;
  }

  async updateSchedule(id: string, data: Record<string, unknown>) {
    return db.update(automationSchedule).set(data).where(eq(automationSchedule.id, id)).returning().then(r => r[0]);
  }

  async deleteSchedule(id: string) {
    await db.delete(automationSchedule).where(eq(automationSchedule.id, id));
  }

  async toggleSchedule(id: string, isActive: boolean) {
    return db.update(automationSchedule).set({ isActive }).where(eq(automationSchedule.id, id)).returning().then(r => r[0]);
  }

  async getDueSchedules() {
    const now = new Date();
    return db.select().from(automationSchedule)
      .where(and(
        eq(automationSchedule.isActive, true),
        lte(automationSchedule.nextRunAt, now)
      ))
      .orderBy(automationSchedule.nextRunAt);
  }

  async markScheduleExecuted(scheduleId: string) {
    const schedule = await this.getSchedule(scheduleId);
    if (!schedule) return null;

    const newRunCount = schedule.runCount + 1;
    const shouldContinue = !schedule.maxRuns || newRunCount < schedule.maxRuns;
    const nextRunAt = shouldContinue ? this.calculateNextRun(schedule.type as ScheduleType, schedule.intervalMs ?? undefined, schedule.cronExpression ?? undefined) : null;

    return db.update(automationSchedule).set({
      lastRunAt: new Date(),
      nextRunAt,
      runCount: newRunCount,
      isActive: shouldContinue,
    }).where(eq(automationSchedule.id, scheduleId)).returning().then(r => r[0]);
  }

  private calculateNextRun(type: ScheduleType, intervalMs?: number, cronExpression?: string): Date {
    const now = new Date();
    switch (type) {
      case "once": return new Date(now.getTime() + (intervalMs || 60000));
      case "interval": return new Date(now.getTime() + (intervalMs || 3600000));
      case "daily": { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d; }
      case "weekly": { const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(0, 0, 0, 0); return d; }
      case "monthly": { const d = new Date(now); d.setMonth(d.getMonth() + 1); d.setDate(1); d.setHours(0, 0, 0, 0); return d; }
      case "yearly": { const d = new Date(now); d.setFullYear(d.getFullYear() + 1); d.setMonth(0); d.setDate(1); d.setHours(0, 0, 0, 0); return d; }
      default: return new Date(now.getTime() + 3600000);
    }
  }

  async getStats(userId: string) {
    const [totalSchedules] = await db.select({ count: sql<number>`count(*)` }).from(automationSchedule).where(eq(automationSchedule.userId, userId));
    const [activeSchedules] = await db.select({ count: sql<number>`count(*)` }).from(automationSchedule).where(and(eq(automationSchedule.userId, userId), eq(automationSchedule.isActive, true)));
    const [totalRuns] = await db.select({ total: sql<number>`coalesce(sum(${automationSchedule.runCount}), 0)` }).from(automationSchedule).where(eq(automationSchedule.userId, userId));

    return {
      totalSchedules: Number(totalSchedules?.count ?? 0),
      activeSchedules: Number(activeSchedules?.count ?? 0),
      totalScheduledRuns: Number(totalRuns?.total ?? 0),
    };
  }
}

export const schedulingEngineService = new SchedulingEngineService();
