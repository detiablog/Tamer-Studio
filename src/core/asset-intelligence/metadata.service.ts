import { db } from "@/lib/db";
import { assetMetadata, assetSearchIndex } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql, like, or, type SQL } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type AssetType = "image" | "video" | "storyboard" | "script" | "caption" | "thumbnail" | "audio" | "voice" | "reference" | "project_file";

export class MetadataService {
  async extractMetadata(userId: string, data: { assetId: string; assetType: AssetType; title?: string; description?: string; width?: number; height?: number; duration?: number; aspectRatio?: string; fileSize?: number; format?: string; language?: string; dominantColors?: string[]; colorPalette?: string[]; projectId?: string; promptReference?: string; workflowReference?: string; publishingReference?: string; aiModel?: string; provider?: string; generationMetadata?: Record<string, unknown> }) {
    const id = generateId("ameta");
    const metadata = await db.insert(assetMetadata).values({ ...data, id, userId }).returning().then(r => r[0]);
    await this.indexForSearch(metadata.id, userId, metadata);
    return metadata;
  }

  async getMetadata(id: string) {
    const [item] = await db.select().from(assetMetadata).where(eq(assetMetadata.id, id)).limit(1);
    return item || null;
  }

  async getMetadataByAssetId(assetId: string) {
    const [item] = await db.select().from(assetMetadata).where(eq(assetMetadata.assetId, assetId)).limit(1);
    return item || null;
  }

  async listMetadata(userId: string, filters?: { assetType?: string; projectId?: string; search?: string; extractionStatus?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions: SQL<unknown>[] = [eq(assetMetadata.userId, userId)];
    if (filters?.assetType) conditions.push(eq(assetMetadata.assetType, filters.assetType));
    if (filters?.projectId) conditions.push(eq(assetMetadata.projectId, filters.projectId));
    if (filters?.extractionStatus) conditions.push(eq(assetMetadata.extractionStatus, filters.extractionStatus));
    if (filters?.search) { const orResult = or(like(assetMetadata.title, `%${filters.search}%`), like(assetMetadata.description, `%${filters.search}%`)); if (orResult) conditions.push(orResult); }
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetMetadata).where(where).orderBy(desc(assetMetadata.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetMetadata).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async updateMetadata(id: string, data: Record<string, unknown>) {
    const updated = await db.update(assetMetadata).set(data).where(eq(assetMetadata.id, id)).returning().then(r => r[0]);
    if (updated) await this.indexForSearch(updated.id, updated.userId, updated);
    return updated;
  }

  async deleteMetadata(id: string) {
    await db.delete(assetSearchIndex).where(eq(assetSearchIndex.assetId, id));
    await db.delete(assetMetadata).where(eq(assetMetadata.id, id));
  }

  private async indexForSearch(metadataId: string, userId: string, metadata: typeof assetMetadata.$inferSelect) {
    const text = [metadata.title, metadata.description, metadata.aiModel, metadata.provider, metadata.promptReference, metadata.assetType].filter(Boolean).join(" ");
    const existing = await db.select().from(assetSearchIndex).where(eq(assetSearchIndex.assetId, metadataId)).limit(1);
    const searchData = { searchText: text, tags: [], categories: [] };
    if (existing.length > 0) {
      await db.update(assetSearchIndex).set({ ...searchData, updatedAt: new Date() }).where(eq(assetSearchIndex.id, existing[0].id));
    } else {
      const sid = generateId("asi");
      await db.insert(assetSearchIndex).values({ id: sid, userId, assetId: metadataId, ...searchData });
    }
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetMetadata).where(eq(assetMetadata.userId, userId));
    const byType = await db.select({ assetType: assetMetadata.assetType, count: sql<number>`count(*)` }).from(assetMetadata).where(eq(assetMetadata.userId, userId)).groupBy(assetMetadata.assetType);
    const [totalSize] = await db.select({ total: sql<number>`coalesce(sum(${assetMetadata.fileSize}), 0)` }).from(assetMetadata).where(eq(assetMetadata.userId, userId));
    return { totalAssets: Number(total?.count ?? 0), byType, totalSizeBytes: Number(totalSize?.total ?? 0) };
  }
}

export const metadataService = new MetadataService();
