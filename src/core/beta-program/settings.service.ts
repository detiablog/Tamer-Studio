import { db } from "@/lib/db";
import { betaSettings } from "@/lib/db/schema/beta";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class BetaSettingsService {
  async getSettings() {
    const [item] = await db.select().from(betaSettings).limit(1);
    if (!item) return this.createDefaults();
    return item;
  }

  async upsertSettings(data: { betaEnabled?: boolean; maxUsers?: number; requireInvitation?: boolean; autoApprove?: boolean; feedbackEnabled?: boolean; bugReportingEnabled?: boolean; featureRequestsEnabled?: boolean; announcementsEnabled?: boolean }) {
    const existing = await this.getSettings();
    return db.update(betaSettings).set(data).where(eq(betaSettings.id, existing.id)).returning().then(r => r[0]);
  }

  private async createDefaults() {
    const id = generateId("bset");
    return db.insert(betaSettings).values({ id }).returning().then(r => r[0]);
  }
}

export const betaSettingsService = new BetaSettingsService();
