import { db } from "@/lib/db";
import { scaleSettings } from "@/lib/db/schema/scaling";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ScaleSettingsService {
  async getSettings() {
    const [existing] = await db.select().from(scaleSettings).limit(1);
    if (existing) return existing;
    const id = generateId("sst");
    const [created] = await db.insert(scaleSettings).values({ id }).returning();
    return created;
  }

  async upsertSettings(data: {
    autoScalingEnabled?: boolean;
    minWorkers?: number;
    maxWorkers?: number;
    scaleUpThreshold?: number;
    scaleDownThreshold?: number;
    healthCheckIntervalMs?: number;
    gracefulShutdownTimeoutMs?: number;
    enableCdn?: boolean;
    cdnProvider?: string;
    cachingEnabled?: boolean;
    defaultCacheTtlSeconds?: number;
    metadata?: Record<string, unknown>;
  }) {
    const existing = await this.getSettings();
    const [updated] = await db.update(scaleSettings).set({ ...data, updatedAt: new Date() }).where(eq(scaleSettings.id, existing.id)).returning();
    return updated;
  }

  async resetSettings() {
    const existing = await this.getSettings();
    const [reset] = await db.update(scaleSettings).set({
      autoScalingEnabled: false,
      minWorkers: 1,
      maxWorkers: 10,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
      healthCheckIntervalMs: 30000,
      gracefulShutdownTimeoutMs: 30000,
      enableCdn: false,
      cdnProvider: null,
      cachingEnabled: true,
      defaultCacheTtlSeconds: 3600,
      metadata: {},
      updatedAt: new Date(),
    }).where(eq(scaleSettings.id, existing.id)).returning();
    return reset;
  }
}

export const scaleSettingsService = new ScaleSettingsService();
