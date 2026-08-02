import { db } from "@/lib/db";
import { opsSettings } from "@/lib/db/schema/operations";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class OpsSettingsService {
  async getSettings() {
    const [item] = await db.select().from(opsSettings).limit(1);
    if (!item) return this.createDefaults();
    return item;
  }

  async upsertSettings(data: { maintenanceMode?: boolean; maintenanceMessage?: string; maintenanceWhitelist?: string[]; alertEmails?: string[]; alertWebhooks?: string[]; healthCheckIntervalMs?: number; autoResolveIncidents?: boolean; retentionDays?: number }) {
    const existing = await this.getSettings();
    return db.update(opsSettings).set(data).where(eq(opsSettings.id, existing.id)).returning().then(r => r[0]);
  }

  async toggleMaintenance(mode: boolean, message?: string) {
    const existing = await this.getSettings();
    return db.update(opsSettings).set({ maintenanceMode: mode, maintenanceMessage: message }).where(eq(opsSettings.id, existing.id)).returning().then(r => r[0]);
  }

  private async createDefaults() {
    const id = generateId("oset");
    return db.insert(opsSettings).values({ id }).returning().then(r => r[0]);
  }
}

export const opsSettingsService = new OpsSettingsService();
