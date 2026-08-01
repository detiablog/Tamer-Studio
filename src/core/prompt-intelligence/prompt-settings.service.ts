import { db } from "@/lib/db";
import { promptSettings } from "@/lib/db/schema/prompt-intelligence";
import { eq, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PromptSettingsService {
  async getSettings(userId: string) {
    const [item] = await db.select().from(promptSettings).where(eq(promptSettings.userId, userId)).limit(1);
    if (!item) return this.createDefaults(userId);
    return item;
  }

  async upsertSettings(userId: string, data: { autoOptimize?: boolean; autoInjectContext?: boolean; autoValidate?: boolean; defaultType?: string; maxPromptLength?: number; showQualityScore?: boolean; notificationEnabled?: boolean; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(promptSettings).where(eq(promptSettings.userId, userId)).limit(1);
    if (existing.length > 0) {
      return db.update(promptSettings).set(data).where(eq(promptSettings.userId, userId)).returning().then(r => r[0]);
    }
    const id = generateId("pset");
    return db.insert(promptSettings).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  private async createDefaults(userId: string) {
    const id = generateId("pset");
    return db.insert(promptSettings).values({ id, userId }).returning().then(r => r[0]);
  }
}

export const promptSettingsService = new PromptSettingsService();
