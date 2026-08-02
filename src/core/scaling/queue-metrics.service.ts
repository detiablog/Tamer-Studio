import { db } from "@/lib/db";
import { scaleQueueMetric } from "@/lib/db/schema/scaling";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class QueueMetricsService {
  async recordSnapshot(data: { queueName: string; queueLength: number; processingCount?: number; completedCount?: number; failedCount?: number; retryingCount?: number; avgWaitTimeMs?: number; avgProcessTimeMs?: number; oldestItemAgeMs?: number }) {
    const id = generateId("sqm");
    return db.insert(scaleQueueMetric).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listQueues() {
    return db.select().from(scaleQueueMetric).orderBy(desc(scaleQueueMetric.createdAt));
  }

  async getLatestSnapshot(queueName: string) {
    const [item] = await db.select().from(scaleQueueMetric).where(eq(scaleQueueMetric.queueName, queueName)).orderBy(desc(scaleQueueMetric.createdAt)).limit(1);
    return item || null;
  }

  async getQueueTrend(queueName: string, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select().from(scaleQueueMetric).where(and(eq(scaleQueueMetric.queueName, queueName), sql`${scaleQueueMetric.createdAt} >= ${since}`)).orderBy(scaleQueueMetric.createdAt);
  }

  async getQueueStats() {
    const [totalQueues] = await db.select({ count: sql<number>`count(DISTINCT ${scaleQueueMetric.queueName})` }).from(scaleQueueMetric);
    const latest = await db.select({ queueName: scaleQueueMetric.queueName, queueLength: scaleQueueMetric.queueLength, processingCount: scaleQueueMetric.processingCount, failedCount: scaleQueueMetric.failedCount, avgWaitTimeMs: scaleQueueMetric.avgWaitTimeMs }).from(scaleQueueMetric).orderBy(desc(scaleQueueMetric.createdAt)).groupBy(scaleQueueMetric.queueName);
    const totalBacklog = latest.reduce((sum, q) => sum + (q.queueLength || 0), 0);
    return { totalQueues: Number(totalQueues?.count ?? 0), queues: latest, totalBacklog };
  }
}

export const queueMetricsService = new QueueMetricsService();
