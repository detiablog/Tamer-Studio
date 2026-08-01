import { db } from "@/lib/db";
import { assetCollection, assetCollectionItem } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class CollectionService {
  async listCollections(userId: string, filters?: { type?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetCollection.userId, userId)];
    if (filters?.type) conditions.push(eq(assetCollection.type, filters.type));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetCollection).where(where).orderBy(desc(assetCollection.isPinned), desc(assetCollection.updatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetCollection).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCollection(userId: string, data: { name: string; description?: string; type?: string; color?: string; rules?: Record<string, unknown> }) {
    const id = generateId("acol");
    return db.insert(assetCollection).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getCollection(id: string) {
    const [item] = await db.select().from(assetCollection).where(eq(assetCollection.id, id)).limit(1);
    return item || null;
  }

  async updateCollection(id: string, data: Record<string, unknown>) {
    return db.update(assetCollection).set(data).where(eq(assetCollection.id, id)).returning().then(r => r[0]);
  }

  async deleteCollection(id: string) {
    await db.delete(assetCollectionItem).where(eq(assetCollectionItem.collectionId, id));
    await db.delete(assetCollection).where(eq(assetCollection.id, id));
  }

  async addAsset(collectionId: string, userId: string, assetId: string) {
    const existing = await db.select().from(assetCollectionItem).where(and(eq(assetCollectionItem.collectionId, collectionId), eq(assetCollectionItem.assetId, assetId))).limit(1);
    if (existing.length > 0) return existing[0];
    const id = generateId("aci");
    const result = await db.insert(assetCollectionItem).values({ id, collectionId, userId, assetId }).returning().then(r => r[0]);
    await db.update(assetCollection).set({ assetCount: sql`${assetCollection.assetCount} + 1` }).where(eq(assetCollection.id, collectionId));
    return result;
  }

  async removeAsset(collectionId: string, assetId: string) {
    await db.delete(assetCollectionItem).where(and(eq(assetCollectionItem.collectionId, collectionId), eq(assetCollectionItem.assetId, assetId)));
    await db.update(assetCollection).set({ assetCount: sql`${assetCollection.assetCount} - 1` }).where(eq(assetCollection.id, collectionId));
  }

  async listAssets(collectionId: string) {
    return db.select().from(assetCollectionItem).where(eq(assetCollectionItem.collectionId, collectionId)).orderBy(assetCollectionItem.position);
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetCollection).where(eq(assetCollection.userId, userId));
    return { totalCollections: Number(total?.count ?? 0) };
  }
}

export const collectionService = new CollectionService();
