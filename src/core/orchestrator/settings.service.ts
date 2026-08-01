import { db } from "@/lib/db";
import { orchestratorSettings } from "@/lib/db/schema/orchestrator";
import { eq } from "drizzle-orm";

export class OrchestratorSettingsService {
  async getSettings(userId: string) {
    const settings = await db
      .select()
      .from(orchestratorSettings)
      .where(eq(orchestratorSettings.userId, userId))
      .limit(1);
    return settings[0] || null;
  }

  async upsertSettings(userId: string, data: {
    maxConcurrentExecutions?: number;
    maxQueueSize?: number;
    maxRetries?: number;
    autoRetry?: boolean;
    autoOptimize?: boolean;
    notificationsEnabled?: boolean;
    creditWarningThreshold?: number;
    defaultPriority?: string;
    allowedModules?: string[];
    metadata?: Record<string, unknown>;
  }) {
    const existing = await this.getSettings(userId);

    if (existing) {
      const [updated] = await db
        .update(orchestratorSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(orchestratorSettings.userId, userId))
        .returning();
      return updated;
    }

    const id = `set_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [created] = await db
      .insert(orchestratorSettings)
      .values({ id, userId, ...data })
      .returning();
    return created;
  }
}

export const orchestratorSettingsService = new OrchestratorSettingsService();
