import { db } from "@/lib/db";
import { promptTemplates } from "@/lib/db/schema/prompt-intelligence";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PromptTemplateService {
  async listTemplates(filters?: { type?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(promptTemplates.isActive, true)];
    if (filters?.type) conditions.push(eq(promptTemplates.type, filters.type));
    if (filters?.category) conditions.push(eq(promptTemplates.category, filters.category));
    if (filters?.search) conditions.push(like(promptTemplates.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(promptTemplates).where(where).orderBy(desc(promptTemplates.usageCount)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(promptTemplates).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getTemplate(id: string) {
    const [item] = await db.select().from(promptTemplates).where(eq(promptTemplates.id, id)).limit(1);
    return item || null;
  }

  async createTemplate(data: { name: string; description?: string; content: string; type: string; category?: string; variables?: string[]; tags?: string[]; isSystem?: boolean }) {
    const id = generateId("ptmpl");
    return db.insert(promptTemplates).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateTemplate(id: string, data: Record<string, unknown>) {
    return db.update(promptTemplates).set(data).where(eq(promptTemplates.id, id)).returning().then(r => r[0]);
  }

  async deleteTemplate(id: string) {
    await db.delete(promptTemplates).where(eq(promptTemplates.id, id));
  }

  async incrementUsage(id: string) {
    return db.update(promptTemplates).set({ usageCount: sql`${promptTemplates.usageCount} + 1` }).where(eq(promptTemplates.id, id)).returning().then(r => r[0]);
  }

  async getStats() {
    const [totalTemplates] = await db.select({ count: sql<number>`count(*)` }).from(promptTemplates).where(eq(promptTemplates.isActive, true));
    const byType = await db.select({ type: promptTemplates.type, count: sql<number>`count(*)` }).from(promptTemplates).where(eq(promptTemplates.isActive, true)).groupBy(promptTemplates.type);
    return { totalTemplates: Number(totalTemplates?.count ?? 0), byType };
  }
}

export const promptTemplateService = new PromptTemplateService();
