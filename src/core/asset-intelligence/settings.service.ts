import { db } from "@/lib/db";
import { assetSettings } from "@/lib/db/schema/asset-intelligence";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AssetSettingsService {
  async getSettings(userId: string) {
    const [item] = await db.select().from(assetSettings).where(eq(assetSettings.userId, userId)).limit(1);
    if (!item) return this.createDefaults(userId);
    return item;
  }

  async upsertSettings(userId: string, data: { autoTagging?: boolean; autoClassification?: boolean; duplicateDetection?: boolean; qualityScoring?: boolean; autoRelationships?: boolean; autoIndexing?: boolean; minQualityScore?: number }) {
    const existing = await db.select().from(assetSettings).where(eq(assetSettings.userId, userId)).limit(1);
    if (existing.length > 0) {
      return db.update(assetSettings).set(data).where(eq(assetSettings.userId, userId)).returning().then(r => r[0]);
    }
    const id = generateId("aset");
    return db.insert(assetSettings).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  private async createDefaults(userId: string) {
    const id = generateId("aset");
    return db.insert(assetSettings).values({ id, userId }).returning().then(r => r[0]);
  }
}

export const assetSettingsService = new AssetSettingsService();
