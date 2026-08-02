import { db } from "@/lib/db";
import { obsSettings } from "@/lib/db/schema/observability";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

const DEFAULT_SETTINGS_ID = "default";

export class ObsSettingsService {
  async getOrCreate() {
    const existing = await db.select().from(obsSettings).where(eq(obsSettings.id, DEFAULT_SETTINGS_ID)).then(r => r[0]);
    if (existing) return existing;
    const id = DEFAULT_SETTINGS_ID;
    return db.insert(obsSettings).values({ id }).returning().then(r => r[0]);
  }

  async update(data: { metricsEnabled?: boolean; loggingEnabled?: boolean; tracingEnabled?: boolean; alertingEnabled?: boolean; samplingRate?: number; maxLogSize?: number; correlationEnabled?: boolean; metadata?: Record<string, unknown> }) {
    const existing = await this.getOrCreate();
    return db.update(obsSettings).set({ ...data, updatedAt: new Date() }).where(eq(obsSettings.id, existing.id)).returning().then(r => r[0]);
  }

  async getRetentionPolicies() {
    const { obsRetentionPolicy } = await import("@/lib/db/schema/observability");
    return db.select().from(obsRetentionPolicy);
  }

  async upsertRetentionPolicy(data: { dataType: string; retentionDays: number; isEnabled?: boolean; metadata?: Record<string, unknown> }) {
    const { obsRetentionPolicy } = await import("@/lib/db/schema/observability");
    const existing = await db.select().from(obsRetentionPolicy).where(eq(obsRetentionPolicy.dataType, data.dataType)).then(r => r[0]);
    if (existing) {
      return db.update(obsRetentionPolicy).set({ ...data, updatedAt: new Date() }).where(eq(obsRetentionPolicy.id, existing.id)).returning().then(r => r[0]);
    }
    const id = generateId("obsrp");
    return db.insert(obsRetentionPolicy).values({ ...data, id }).returning().then(r => r[0]);
  }
}

export const obsSettingsService = new ObsSettingsService();
