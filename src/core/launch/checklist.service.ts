import { db } from "@/lib/db";
import { launchChecklist } from "@/lib/db/schema/launch";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ChecklistService {
  async createItem(data: { category: string; item: string; description?: string; severity?: string; assignedTo?: string }) {
    const id = generateId("lchk");
    return db.insert(launchChecklist).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listItems(filters?: { category?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.category) conditions.push(eq(launchChecklist.category, filters.category));
    if (filters?.status) conditions.push(eq(launchChecklist.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(launchChecklist).where(where).orderBy(launchChecklist.category, launchChecklist.item).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(launchChecklist).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getItem(id: string) {
    const [item] = await db.select().from(launchChecklist).where(eq(launchChecklist.id, id)).limit(1);
    return item || null;
  }

  async updateItem(id: string, data: Record<string, unknown>) {
    return db.update(launchChecklist).set(data).where(eq(launchChecklist.id, id)).returning().then(r => r[0]);
  }

  async verifyItem(id: string, notes?: string) {
    return db.update(launchChecklist).set({ status: "verified", verifiedAt: new Date(), notes }).where(eq(launchChecklist.id, id)).returning().then(r => r[0]);
  }

  async blockItem(id: string, notes: string) {
    return db.update(launchChecklist).set({ status: "blocked", notes }).where(eq(launchChecklist.id, id)).returning().then(r => r[0]);
  }

  async deleteItem(id: string) {
    await db.delete(launchChecklist).where(eq(launchChecklist.id, id));
  }

  async getProgress() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(launchChecklist);
    const [verified] = await db.select({ count: sql<number>`count(*)` }).from(launchChecklist).where(eq(launchChecklist.status, "verified"));
    const [blocked] = await db.select({ count: sql<number>`count(*)` }).from(launchChecklist).where(eq(launchChecklist.status, "blocked"));
    const byCategory = await db.select({ category: launchChecklist.category, total: sql<number>`count(*)`, verified: sql<number>`count(*) filter (where ${launchChecklist.status} = 'verified')` }).from(launchChecklist).groupBy(launchChecklist.category);
    const totalN = Number(total?.count ?? 0);
    const verifiedN = Number(verified?.count ?? 0);
    return { total: totalN, verified: verifiedN, blocked: Number(blocked?.count ?? 0), pending: totalN - verifiedN, progressPercent: totalN > 0 ? Math.round((verifiedN / totalN) * 100) : 0, byCategory };
  }
}

export const checklistService = new ChecklistService();
