import { db } from "@/lib/db";
import { scaleWorkerMetric } from "@/lib/db/schema/scaling";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class WorkerMetricsService {
  async registerWorker(data: { workerId: string; workerType: string; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(scaleWorkerMetric).where(eq(scaleWorkerMetric.workerId, data.workerId)).limit(1);
    if (existing.length > 0) {
      return db.update(scaleWorkerMetric).set({ status: "active", metadata: data.metadata || {} }).where(eq(scaleWorkerMetric.workerId, data.workerId)).returning().then(r => r[0]);
    }
    const id = generateId("swk");
    return db.insert(scaleWorkerMetric).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateWorkerStatus(workerId: string, data: { status?: string; cpuUsage?: number; memoryUsageMb?: number; currentJob?: string; jobsProcessed?: number; jobsFailed?: number; avgJobDurationMs?: number }) {
    return db.update(scaleWorkerMetric).set(data).where(eq(scaleWorkerMetric.workerId, workerId)).returning().then(r => r[0]);
  }

  async heartbeat(workerId: string) {
    return db.update(scaleWorkerMetric).set({ updatedAt: new Date() }).where(eq(scaleWorkerMetric.workerId, workerId)).returning().then(r => r[0]);
  }

  async listWorkers(filters?: { workerType?: string; status?: string }) {
    const conditions = [];
    if (filters?.workerType) conditions.push(eq(scaleWorkerMetric.workerType, filters.workerType));
    if (filters?.status) conditions.push(eq(scaleWorkerMetric.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(scaleWorkerMetric).where(where).orderBy(desc(scaleWorkerMetric.updatedAt));
  }

  async getActiveWorkers() {
    return db.select().from(scaleWorkerMetric).where(eq(scaleWorkerMetric.status, "active")).orderBy(desc(scaleWorkerMetric.updatedAt));
  }

  async getWorkerStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(scaleWorkerMetric);
    const [active] = await db.select({ count: sql<number>`count(*)` }).from(scaleWorkerMetric).where(eq(scaleWorkerMetric.status, "active"));
    const [idle] = await db.select({ count: sql<number>`count(*)` }).from(scaleWorkerMetric).where(eq(scaleWorkerMetric.status, "idle"));
    const [failed] = await db.select({ count: sql<number>`count(*)` }).from(scaleWorkerMetric).where(eq(scaleWorkerMetric.status, "failed"));
    const [totalJobs] = await db.select({ total: sql<number>`coalesce(sum(${scaleWorkerMetric.jobsProcessed}), 0)` }).from(scaleWorkerMetric);
    const [avgCpu] = await db.select({ avg: sql<number>`coalesce(avg(${scaleWorkerMetric.cpuUsage}), 0)` }).from(scaleWorkerMetric);
    const [avgMemory] = await db.select({ avg: sql<number>`coalesce(avg(${scaleWorkerMetric.memoryUsageMb}), 0)` }).from(scaleWorkerMetric);
    return {
      total: Number(total?.count ?? 0), active: Number(active?.count ?? 0), idle: Number(idle?.count ?? 0), failed: Number(failed?.count ?? 0),
      totalJobs: Number(totalJobs?.total ?? 0), avgCpu: Math.round(Number(avgCpu?.avg ?? 0)), avgMemory: Math.round(Number(avgMemory?.avg ?? 0)),
    };
  }

  async removeWorker(workerId: string) {
    await db.delete(scaleWorkerMetric).where(eq(scaleWorkerMetric.workerId, workerId));
  }
}

export const workerMetricsService = new WorkerMetricsService();
