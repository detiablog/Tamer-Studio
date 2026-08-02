import { db } from "@/lib/db";
import { secSettings } from "@/lib/db/schema/security";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class SecuritySettingsService {
  async getSettings() {
    const [item] = await db.select().from(secSettings).limit(1);
    if (!item) return this.createDefaults();
    return item;
  }

  async upsertSettings(data: { bruteForceProtection?: boolean; maxLoginAttempts?: number; lockoutDurationMinutes?: number; sessionTimeoutMinutes?: number; maxConcurrentSessions?: number; ipWhitelist?: string[]; ipBlacklist?: string[]; uploadMaxSizeMb?: number; uploadAllowedTypes?: string[]; rateLimitEnabled?: boolean; cspEnabled?: boolean; hstsEnabled?: boolean }) {
    const existing = await this.getSettings();
    return db.update(secSettings).set(data).where(eq(secSettings.id, existing.id)).returning().then(r => r[0]);
  }

  private async createDefaults() {
    const id = generateId("sset");
    return db.insert(secSettings).values({ id }).returning().then(r => r[0]);
  }
}

export const securitySettingsService = new SecuritySettingsService();
