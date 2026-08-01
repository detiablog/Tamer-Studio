import { db } from "@/lib/db";
import { assetTag, assetTagAssignment } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class TaggingService {
  async listTags(userId: string, filters?: { category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetTag.userId, userId)];
    if (filters?.category) conditions.push(eq(assetTag.category, filters.category));
    if (filters?.search) conditions.push(like(assetTag.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetTag).where(where).orderBy(desc(assetTag.useCount)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetTag).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createTag(userId: string, data: { name: string; category?: string }) {
    const id = generateId("atag");
    return db.insert(assetTag).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async updateTag(id: string, data: Record<string, unknown>) {
    return db.update(assetTag).set(data).where(eq(assetTag.id, id)).returning().then(r => r[0]);
  }

  async deleteTag(id: string) {
    await db.delete(assetTagAssignment).where(eq(assetTagAssignment.tagId, id));
    await db.delete(assetTag).where(eq(assetTag.id, id));
  }

  async tagAsset(userId: string, assetId: string, tagId: string, isAuto = true) {
    const existing = await db.select().from(assetTagAssignment).where(and(eq(assetTagAssignment.assetId, assetId), eq(assetTagAssignment.tagId, tagId))).limit(1);
    if (existing.length > 0) return existing[0];
    const id = generateId("ata");
    const result = await db.insert(assetTagAssignment).values({ id, userId, assetId, tagId, isAuto }).returning().then(r => r[0]);
    await db.update(assetTag).set({ useCount: sql`${assetTag.useCount} + 1` as unknown as number }).where(eq(assetTag.id, tagId));
    return result;
  }

  async untagAsset(assetId: string, tagId: string) {
    await db.delete(assetTagAssignment).where(and(eq(assetTagAssignment.assetId, assetId), eq(assetTagAssignment.tagId, tagId)));
  }

  async getAssetTags(assetId: string) {
    return db.select().from(assetTagAssignment).where(eq(assetTagAssignment.assetId, assetId));
  }

  async getAssetsByTag(userId: string, tagId: string) {
    return db.select().from(assetTagAssignment).where(and(eq(assetTagAssignment.userId, userId), eq(assetTagAssignment.tagId, tagId)));
  }

  async autoTagAsset(userId: string, assetId: string, metadata: Record<string, unknown>) {
    const autoTags: string[] = [];
    const assetType = metadata.assetType as string;
    if (assetType) autoTags.push(assetType);

    if (metadata.dominantColors && Array.isArray(metadata.dominantColors)) {
      (metadata.dominantColors as string[]).slice(0, 3).forEach(c => autoTags.push(c.toLowerCase()));
    }
    if (metadata.aiModel) autoTags.push(metadata.aiModel as string);
    if (metadata.platform) autoTags.push(metadata.platform as string);
    if (metadata.width && metadata.height) {
      const ratio = (metadata.width as number) / (metadata.height as number);
      if (ratio > 1.5) autoTags.push("landscape");
      else if (ratio < 0.7) autoTags.push("portrait");
      else autoTags.push("square");
    }
    if (metadata.duration) {
      if ((metadata.duration as number) < 60) autoTags.push("short");
      else autoTags.push("long");
    }

    const assigned: string[] = [];
    for (const tagName of autoTags) {
      let [existingTag] = await db.select().from(assetTag).where(and(eq(assetTag.userId, userId), eq(assetTag.name, tagName))).limit(1);
      if (!existingTag) {
        const id = generateId("atag");
        [existingTag] = await db.insert(assetTag).values({ id, userId, name: tagName, isSystem: true }).returning();
      }
      await this.tagAsset(userId, assetId, existingTag.id, true);
      assigned.push(tagName);
    }
    return assigned;
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetTag).where(eq(assetTag.userId, userId));
    const [totalAssignments] = await db.select({ count: sql<number>`count(*)` }).from(assetTagAssignment).where(eq(assetTagAssignment.userId, userId));
    return { totalTags: Number(total?.count ?? 0), totalAssignments: Number(totalAssignments?.count ?? 0) };
  }
}

export const taggingService = new TaggingService();
