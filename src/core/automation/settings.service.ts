import { db } from "@/lib/db";
import { automationSettings } from "@/lib/db/schema/automation";
import { eq, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AutomationSettingsService {
  async getSettings(userId: string) {
    const [item] = await db.select().from(automationSettings).where(eq(automationSettings.userId, userId)).limit(1);
    if (!item) return this.createDefaults(userId);
    return item;
  }

  async upsertSettings(userId: string, data: { maxConcurrentExecutions?: number; maxQueueSize?: number; maxRetries?: number; retryDelayMs?: number; autoRetry?: boolean; notificationsEnabled?: boolean; creditWarningThreshold?: number; defaultPriority?: string; allowedModules?: string[]; excludedModules?: string[]; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(automationSettings).where(eq(automationSettings.userId, userId)).limit(1);
    if (existing.length > 0) {
      return db.update(automationSettings).set(data).where(eq(automationSettings.userId, userId)).returning().then(r => r[0]);
    }
    const id = generateId("aset");
    return db.insert(automationSettings).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  private async createDefaults(userId: string) {
    const id = generateId("aset");
    return db.insert(automationSettings).values({ id, userId }).returning().then(r => r[0]);
  }
}

export const automationSettingsService = new AutomationSettingsService();
