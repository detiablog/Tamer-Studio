import { db } from "@/lib/db";
import { aiPromptTemplate } from "@/lib/db/schema/ai-runtime";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PromptService {
  async listTemplates(filters?: { userId?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(aiPromptTemplate.userId, filters.userId));
    if (filters?.category) conditions.push(eq(aiPromptTemplate.category, filters.category));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(aiPromptTemplate).where(where).orderBy(desc(aiPromptTemplate.useCount)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(aiPromptTemplate).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit };
  }

  async createTemplate(data: { name: string; description?: string; category?: string; prompt: string; variables?: string[]; modelHint?: string; userId?: string }) {
    const id = generateId("prompt");
    return db.insert(aiPromptTemplate).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateTemplate(id: string, data: Record<string, unknown>) {
    return db.update(aiPromptTemplate).set({ ...data, updatedAt: new Date() }).where(eq(aiPromptTemplate.id, id)).returning().then(r => r[0]);
  }

  async deleteTemplate(id: string) {
    await db.delete(aiPromptTemplate).where(eq(aiPromptTemplate.id, id));
  }

  async incrementUseCount(id: string) {
    await db.update(aiPromptTemplate).set({ useCount: sql`${aiPromptTemplate.useCount} + 1` }).where(eq(aiPromptTemplate.id, id));
  }
}

export const promptService = new PromptService();
