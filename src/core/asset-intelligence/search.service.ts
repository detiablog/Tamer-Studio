import { db } from "@/lib/db";
import { assetSearchIndex, assetMetadata } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export interface SearchFilters {
  assetType?: string;
  projectId?: string;
  tags?: string[];
  category?: string;
  qualityMin?: number;
  qualityMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  provider?: string;
  language?: string;
}

export class SearchService {
  async search(userId: string, query: string, filters?: SearchFilters, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [eq(assetSearchIndex.userId, userId), like(assetSearchIndex.searchText, `%${query}%`)];

    if (filters?.assetType) conditions.push(sql`${assetSearchIndex.id} IN (SELECT id FROM asset_metadata WHERE asset_type = ${filters.assetType})`);
    if (filters?.tags && filters.tags.length > 0) conditions.push(sql`${assetSearchIndex.tags} @> ${JSON.stringify(filters.tags)}`);

    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetSearchIndex).where(where).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetSearchIndex).where(where),
    ]);

    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async rebuildIndex(userId: string) {
    const assets = await db.select().from(assetMetadata).where(eq(assetMetadata.userId, userId));
    let indexed = 0;
    for (const asset of assets) {
      const text = [asset.title, asset.description, asset.aiModel, asset.provider, asset.promptReference, asset.assetType].filter(Boolean).join(" ");
      const existing = await db.select().from(assetSearchIndex).where(eq(assetSearchIndex.assetId, asset.id)).limit(1);
      if (existing.length > 0) {
        await db.update(assetSearchIndex).set({ searchText: text, updatedAt: new Date() }).where(eq(assetSearchIndex.id, existing[0].id));
      } else {
        const id = `asi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await db.insert(assetSearchIndex).values({ id, userId, assetId: asset.id, searchText: text, tags: [], categories: [] });
      }
      indexed++;
    }
    return { indexed };
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetSearchIndex).where(eq(assetSearchIndex.userId, userId));
    return { totalIndexed: Number(total?.count ?? 0) };
  }
}

export const searchService = new SearchService();
