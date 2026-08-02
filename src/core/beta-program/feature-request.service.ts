import { db } from "@/lib/db";
import { betaFeatureRequest } from "@/lib/db/schema/beta";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class FeatureRequestService {
  async submitRequest(userId: string, data: { title: string; description?: string; businessValue?: string; useCase?: string; category?: string }) {
    const id = generateId("bfreq");
    return db.insert(betaFeatureRequest).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listRequests(filters?: { status?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(betaFeatureRequest.status, filters.status));
    if (filters?.category) conditions.push(eq(betaFeatureRequest.category, filters.category));
    if (filters?.search) conditions.push(like(betaFeatureRequest.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaFeatureRequest).where(where).orderBy(desc(betaFeatureRequest.votes), desc(betaFeatureRequest.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaFeatureRequest).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getRequest(id: string) {
    const [item] = await db.select().from(betaFeatureRequest).where(eq(betaFeatureRequest.id, id)).limit(1);
    return item || null;
  }

  async voteRequest(id: string) {
    return db.update(betaFeatureRequest).set({ votes: sql`${betaFeatureRequest.votes} + 1` }).where(eq(betaFeatureRequest.id, id)).returning().then(r => r[0]);
  }

  async updateRequest(id: string, data: Record<string, unknown>) {
    return db.update(betaFeatureRequest).set(data).where(eq(betaFeatureRequest.id, id)).returning().then(r => r[0]);
  }

  async deleteRequest(id: string) {
    await db.delete(betaFeatureRequest).where(eq(betaFeatureRequest.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(betaFeatureRequest);
    const [open] = await db.select({ count: sql<number>`count(*)` }).from(betaFeatureRequest).where(eq(betaFeatureRequest.status, "open"));
    const [totalVotes] = await db.select({ total: sql<number>`coalesce(sum(${betaFeatureRequest.votes}), 0)` }).from(betaFeatureRequest);
    return { total: Number(total?.count ?? 0), open: Number(open?.count ?? 0), totalVotes: Number(totalVotes?.total ?? 0) };
  }
}

export const featureRequestService = new FeatureRequestService();
