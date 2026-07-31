import { db } from "@/lib/db";
import { pricingItem, pricingVersion, pricingRegion, pricingTax, pricingFee } from "@/lib/db/schema/pricing";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PricingRepository {
  async findPricingItems(filters?: { category?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.category) conditions.push(eq(pricingItem.category, filters.category));
    if (filters?.status) conditions.push(eq(pricingItem.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(pricingItem).where(where).orderBy(desc(pricingItem.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(pricingItem).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async findPricingItemById(id: string) {
    const [item] = await db.select().from(pricingItem).where(eq(pricingItem.id, id)).limit(1);
    return item;
  }

  async findPricingItemBySlug(slug: string) {
    const [item] = await db.select().from(pricingItem).where(eq(pricingItem.slug, slug)).limit(1);
    return item;
  }

  async createPricingItem(data: Omit<typeof pricingItem.$inferInsert, "id">) {
    const id = generateId("prc");
    const [item] = await db.insert(pricingItem).values({ ...data, id }).returning();
    return item;
  }

  async updatePricingItem(id: string, data: Partial<typeof pricingItem.$inferInsert>) {
    const [item] = await db
      .update(pricingItem)
      .set({ ...data, version: sql`${pricingItem.version} + 1`, updatedAt: new Date() })
      .where(eq(pricingItem.id, id))
      .returning();
    return item;
  }

  async deletePricingItem(id: string) {
    await db.delete(pricingItem).where(eq(pricingItem.id, id));
  }

  async createVersion(pricingItemId: string, data: Record<string, unknown>, createdBy?: string) {
    const existingVersions = await db
      .select({ version: pricingVersion.version })
      .from(pricingVersion)
      .where(eq(pricingVersion.pricingItemId, pricingItemId))
      .orderBy(desc(pricingVersion.version))
      .limit(1);
    const nextVersion = (existingVersions[0]?.version ?? 0) + 1;
    const id = generateId("prv");
    const [item] = await db
      .insert(pricingVersion)
      .values({ id, pricingItemId, version: nextVersion, data, createdBy })
      .returning();
    return item;
  }

  async getVersions(pricingItemId: string) {
    return db
      .select()
      .from(pricingVersion)
      .where(eq(pricingVersion.pricingItemId, pricingItemId))
      .orderBy(desc(pricingVersion.version));
  }

  async findRegions(pricingItemId: string) {
    return db
      .select()
      .from(pricingRegion)
      .where(eq(pricingRegion.pricingItemId, pricingItemId))
      .orderBy(desc(pricingRegion.createdAt));
  }

  async upsertRegion(data: { pricingItemId: string; country: string; region?: string; currency: string; overridePrice: string; overrideSalePrice?: string; isActive?: boolean }) {
    const [existing] = await db
      .select()
      .from(pricingRegion)
      .where(and(eq(pricingRegion.pricingItemId, data.pricingItemId), eq(pricingRegion.country, data.country)))
      .limit(1);
    if (existing) {
      const [updated] = await db
        .update(pricingRegion)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingRegion.id, existing.id))
        .returning();
      return updated;
    }
    const id = generateId("prg");
    const [created] = await db
      .insert(pricingRegion)
      .values({ id, ...data })
      .returning();
    return created;
  }

  async deleteRegion(id: string) {
    await db.delete(pricingRegion).where(eq(pricingRegion.id, id));
  }

  async findActiveTaxes(country?: string) {
    const conditions = [eq(pricingTax.isActive, true)];
    if (country) conditions.push(eq(pricingTax.country, country));
    return db.select().from(pricingTax).where(and(...conditions));
  }

  async findActiveFees() {
    return db.select().from(pricingFee).where(eq(pricingFee.isActive, true));
  }

  async createTax(data: { name: string; type: string; rate: string; country?: string; region?: string }) {
    const id = generateId("prt");
    const [item] = await db.insert(pricingTax).values({ id, ...data }).returning();
    return item;
  }

  async createFee(data: { name: string; type: string; rate: string; minAmount?: string; maxAmount?: string }) {
    const id = generateId("prf");
    const [item] = await db.insert(pricingFee).values({ id, ...data }).returning();
    return item;
  }

  async getDashboardStats() {
    const [totalItems] = await db.select({ count: sql<number>`count(*)` }).from(pricingItem);
    const [activeItems] = await db.select({ count: sql<number>`count(*)` }).from(pricingItem).where(eq(pricingItem.status, "active"));
    const [draftItems] = await db.select({ count: sql<number>`count(*)` }).from(pricingItem).where(eq(pricingItem.status, "draft"));
    const [totalRegions] = await db.select({ count: sql<number>`count(*)` }).from(pricingRegion);
    const [totalTaxes] = await db.select({ count: sql<number>`count(*)` }).from(pricingTax).where(eq(pricingTax.isActive, true));
    const [totalFees] = await db.select({ count: sql<number>`count(*)` }).from(pricingFee).where(eq(pricingFee.isActive, true));
    return {
      totalItems: Number(totalItems?.count ?? 0),
      activeItems: Number(activeItems?.count ?? 0),
      draftItems: Number(draftItems?.count ?? 0),
      totalRegions: Number(totalRegions?.count ?? 0),
      totalTaxes: Number(totalTaxes?.count ?? 0),
      totalFees: Number(totalFees?.count ?? 0),
    };
  }
}

export const pricingRepository = new PricingRepository();
