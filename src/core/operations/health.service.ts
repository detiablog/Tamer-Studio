import { db } from "@/lib/db";
import { opsHealthSnapshot } from "@/lib/db/schema/operations";
import { desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class OpsHealthService {
  async takeSnapshot(data: { overallStatus?: string; databaseStatus?: string; redisStatus?: string; storageStatus?: string; aiRuntimeStatus?: string; smtpStatus?: string; queueStatus?: string; workerStatus?: string; databaseLatencyMs?: number; redisLatencyMs?: number; totalUsers?: number; activeUsers?: number; totalSessions?: number; cpuUsage?: number; memoryUsage?: number; diskUsage?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("ohs");
    return db.insert(opsHealthSnapshot).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getLatestSnapshot() {
    const [item] = await db.select().from(opsHealthSnapshot).orderBy(desc(opsHealthSnapshot.createdAt)).limit(1);
    return item || null;
  }

  async listSnapshots(limit = 50) {
    return db.select().from(opsHealthSnapshot).orderBy(desc(opsHealthSnapshot.createdAt)).limit(limit);
  }

  async getHealthTrend(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.select().from(opsHealthSnapshot).where(sql`${opsHealthSnapshot.createdAt} >= ${since}`).orderBy(opsHealthSnapshot.createdAt);
  }

  async getOverallStatus() {
    const latest = await this.getLatestSnapshot();
    return {
      status: latest?.overallStatus || "unknown",
      database: latest?.databaseStatus || "unknown",
      redis: latest?.redisStatus || "unknown",
      storage: latest?.storageStatus || "unknown",
      aiRuntime: latest?.aiRuntimeStatus || "unknown",
      smtp: latest?.smtpStatus || "unknown",
      queue: latest?.queueStatus || "unknown",
      worker: latest?.workerStatus || "unknown",
      databaseLatencyMs: latest?.databaseLatencyMs || 0,
      redisLatencyMs: latest?.redisLatencyMs || 0,
      cpuUsage: latest?.cpuUsage || 0,
      memoryUsage: latest?.memoryUsage || 0,
      diskUsage: latest?.diskUsage || 0,
      lastChecked: latest?.createdAt || null,
    };
  }
}

export const opsHealthService = new OpsHealthService();
