import { db } from "@/lib/db";
import { assetRelationship } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type RelationshipType = "image_to_video" | "storyboard_to_episode" | "prompt_to_image" | "image_to_thumbnail" | "campaign_to_assets" | "character_to_images" | "story_to_scenes" | "project_to_files" | "version_of" | "derived_from";

export class RelationshipService {
  async createRelationship(userId: string, data: { sourceAssetId: string; targetAssetId: string; relationshipType: RelationshipType; strength?: number; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(assetRelationship).where(and(eq(assetRelationship.sourceAssetId, data.sourceAssetId), eq(assetRelationship.targetAssetId, data.targetAssetId), eq(assetRelationship.relationshipType, data.relationshipType))).limit(1);
    if (existing.length > 0) return existing[0];
    const id = generateId("arel");
    return db.insert(assetRelationship).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listRelationships(userId: string, filters?: { assetId?: string; relationshipType?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetRelationship.userId, userId)];
    if (filters?.assetId) conditions.push(sql`(${assetRelationship.sourceAssetId} = ${filters.assetId} OR ${assetRelationship.targetAssetId} = ${filters.assetId})`);
    if (filters?.relationshipType) conditions.push(eq(assetRelationship.relationshipType, filters.relationshipType));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetRelationship).where(where).orderBy(desc(assetRelationship.strength)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetRelationship).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getRelationshipsByAsset(assetId: string) {
    return db.select().from(assetRelationship).where(sql`(${assetRelationship.sourceAssetId} = ${assetId} OR ${assetRelationship.targetAssetId} = ${assetId})`).orderBy(desc(assetRelationship.strength));
  }

  async deleteRelationship(id: string) {
    await db.delete(assetRelationship).where(eq(assetRelationship.id, id));
  }

  async autoRelate(userId: string, assetId: string, relatedAssets: Array<{ targetAssetId: string; relationshipType: RelationshipType; strength?: number }>) {
    const created: string[] = [];
    for (const rel of relatedAssets) {
      await this.createRelationship(userId, { sourceAssetId: assetId, ...rel });
      created.push(rel.targetAssetId);
    }
    return created;
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetRelationship).where(eq(assetRelationship.userId, userId));
    const byType = await db.select({ relationshipType: assetRelationship.relationshipType, count: sql<number>`count(*)` }).from(assetRelationship).where(eq(assetRelationship.userId, userId)).groupBy(assetRelationship.relationshipType);
    return { totalRelationships: Number(total?.count ?? 0), byType };
  }
}

export const relationshipService = new RelationshipService();
