import { db } from "@/lib/db";
import { launchSettings } from "@/lib/db/schema/launch";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class LaunchSettingsService {
  async getSettings() {
    const [item] = await db.select().from(launchSettings).limit(1);
    if (!item) return this.createDefaults();
    return item;
  }

  async upsertSettings(data: { launchVersion?: string; launchDate?: Date; isPublicRegistrationEnabled?: boolean; maintenanceMode?: boolean; emergencyBanner?: string; launchFreeze?: boolean; statusPage?: string }) {
    const existing = await this.getSettings();
    return db.update(launchSettings).set(data).where(eq(launchSettings.id, existing.id)).returning().then(r => r[0]);
  }

  private async createDefaults() {
    const id = generateId("lset");
    return db.insert(launchSettings).values({ id }).returning().then(r => r[0]);
  }
}

export const launchSettingsService = new LaunchSettingsService();
