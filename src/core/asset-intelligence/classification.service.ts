import { db } from "@/lib/db";
import { assetClassification, assetCategory } from "@/lib/db/schema/asset-intelligence";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ClassificationService {
  async classifyAsset(userId: string, data: { assetId: string; projectId?: string; campaign?: string; story?: string; character?: string; brand?: string; platform?: string; contentType?: string; mediaType?: string; style?: string; theme?: string; genre?: string; status?: string; confidence?: number }) {
    const existing = await db.select().from(assetClassification).where(eq(assetClassification.assetId, data.assetId)).limit(1);
    if (existing.length > 0) {
      return db.update(assetClassification).set({ ...data, updatedAt: new Date() }).where(eq(assetClassification.id, existing[0].id)).returning().then(r => r[0]);
    }
    const id = generateId("aclas");
    return db.insert(assetClassification).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getClassification(assetId: string) {
    const [item] = await db.select().from(assetClassification).where(eq(assetClassification.assetId, assetId)).limit(1);
    return item || null;
  }

  async listClassifications(userId: string, filters?: { projectId?: string; character?: string; brand?: string; platform?: string; contentType?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetClassification.userId, userId)];
    if (filters?.projectId) conditions.push(eq(assetClassification.projectId, filters.projectId));
    if (filters?.character) conditions.push(eq(assetClassification.character, filters.character));
    if (filters?.brand) conditions.push(eq(assetClassification.brand, filters.brand));
    if (filters?.platform) conditions.push(eq(assetClassification.platform, filters.platform));
    if (filters?.contentType) conditions.push(eq(assetClassification.contentType, filters.contentType));
    if (filters?.search) conditions.push(like(assetClassification.campaign, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetClassification).where(where).orderBy(desc(assetClassification.confidence)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetClassification).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async updateClassification(id: string, data: Record<string, unknown>) {
    return db.update(assetClassification).set(data).where(eq(assetClassification.id, id)).returning().then(r => r[0]);
  }

  async deleteClassification(id: string) {
    await db.delete(assetClassification).where(eq(assetClassification.id, id));
  }

  async listCategories(userId: string, filters?: { type?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(assetCategory.userId, userId)];
    if (filters?.type) conditions.push(eq(assetCategory.type, filters.type));
    if (filters?.search) conditions.push(like(assetCategory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(assetCategory).where(where).orderBy(assetCategory.sortOrder).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(assetCategory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCategory(userId: string, data: { name: string; parent?: string; type: string; description?: string; icon?: string; sortOrder?: number }) {
    const id = generateId("acat");
    return db.insert(assetCategory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async updateCategory(id: string, data: Record<string, unknown>) {
    return db.update(assetCategory).set(data).where(eq(assetCategory.id, id)).returning().then(r => r[0]);
  }

  async deleteCategory(id: string) {
    await db.delete(assetCategory).where(eq(assetCategory.id, id));
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(assetClassification).where(eq(assetClassification.userId, userId));
    const [totalCats] = await db.select({ count: sql<number>`count(*)` }).from(assetCategory).where(eq(assetCategory.userId, userId));
    return { totalClassifications: Number(total?.count ?? 0), totalCategories: Number(totalCats?.count ?? 0) };
  }
}

export const classificationService = new ClassificationService();
