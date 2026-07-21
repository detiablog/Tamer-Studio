import { db } from "@/lib/db";
import { supportKnowledgeCategory, supportKnowledgeArticle } from "@/lib/db/schema/support";
import { eq, and, desc, sql, ilike, or, ne, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { KnowledgeCategory, KnowledgeArticle, CreateCategoryInput, ArticleFilter } from "./types";

export class KnowledgeRepository {
  async createCategory(input: CreateCategoryInput): Promise<KnowledgeCategory> {
    const id = input.name.toLowerCase().replace(/\s+/g, "-").slice(0, 50);
    const finalId = `kcat_${id}_${randomUUID().slice(0, 8)}`;
    const now = new Date();

    const [row] = await db.insert(supportKnowledgeCategory).values({
      id: finalId,
      name: input.name,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapCategory(row);
  }

  async getCategories(): Promise<KnowledgeCategory[]> {
    const rows = await db.select().from(supportKnowledgeCategory).orderBy(supportKnowledgeCategory.name);
    return rows.map(this.mapCategory);
  }

  async getCategory(id: string): Promise<KnowledgeCategory | undefined> {
    const rows = await db.select().from(supportKnowledgeCategory).where(eq(supportKnowledgeCategory.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapCategory(rows[0]);
  }

  async createArticle(input: { id?: string } & Omit<KnowledgeArticle, "id" | "createdAt" | "updatedAt" | "deletedAt" | "version">): Promise<KnowledgeArticle> {
    const id = input.id ?? `kart_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportKnowledgeArticle).values({
      id,
      categoryId: input.categoryId,
      title: input.title,
      content: input.content,
      status: input.status ?? "draft",
      version: 1,
      relatedArticles: input.relatedArticles ?? [],
      publishedAt: input.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapArticle(row);
  }

  async getArticle(id: string): Promise<KnowledgeArticle | undefined> {
    const rows = await db.select().from(supportKnowledgeArticle).where(and(eq(supportKnowledgeArticle.id, id), isNull(supportKnowledgeArticle.deletedAt))).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapArticle(rows[0]);
  }

  async listArticles(filter?: ArticleFilter): Promise<KnowledgeArticle[]> {
    const conditions = [isNull(supportKnowledgeArticle.deletedAt)];

    if (filter?.categoryId) conditions.push(eq(supportKnowledgeArticle.categoryId, filter.categoryId));
    if (filter?.status) conditions.push(eq(supportKnowledgeArticle.status, filter.status));
    if (filter?.search) {
      const searchCondition = or(ilike(supportKnowledgeArticle.title, `%${filter.search}%`), ilike(supportKnowledgeArticle.content, `%${filter.search}%`));
      if (searchCondition) conditions.push(searchCondition);
    }

    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const rows = await db.select().from(supportKnowledgeArticle).where(and(...conditions)).orderBy(desc(supportKnowledgeArticle.updatedAt)).limit(limit).offset(offset);

    return rows.map(this.mapArticle);
  }

  async updateArticle(id: string, input: Partial<Omit<KnowledgeArticle, "id" | "createdAt">>): Promise<KnowledgeArticle | undefined> {
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (input.title !== undefined) updates.title = input.title;
    if (input.content !== undefined) updates.content = input.content;
    if (input.categoryId !== undefined) updates.categoryId = input.categoryId;
    if (input.status !== undefined) {
      updates.status = input.status;
      if (input.status === "published") updates.publishedAt = now;
    }
    if (input.relatedArticles !== undefined) updates.relatedArticles = input.relatedArticles;

    if (input.content !== undefined || input.title !== undefined) {
      updates.version = sql`${supportKnowledgeArticle.version} + 1`;
    }

    const rows = await db.update(supportKnowledgeArticle).set(updates).where(and(eq(supportKnowledgeArticle.id, id), isNull(supportKnowledgeArticle.deletedAt))).returning();
    if (rows.length === 0) return undefined;
    return this.mapArticle(rows[0]);
  }

  async softDeleteArticle(id: string): Promise<void> {
    const now = new Date();
    await db.update(supportKnowledgeArticle).set({ deletedAt: now, updatedAt: now, status: "archived" }).where(eq(supportKnowledgeArticle.id, id));
  }

  async getRelatedArticles(articleId: string, limit = 10): Promise<KnowledgeArticle[]> {
    const article = await this.getArticle(articleId);
    if (!article) return [];

    const related = await db.select().from(supportKnowledgeArticle).where(and(eq(supportKnowledgeArticle.categoryId, article.categoryId), isNull(supportKnowledgeArticle.deletedAt), ne(supportKnowledgeArticle.id, articleId))).limit(limit);

    return related.map(this.mapArticle);
  }

  private mapCategory(row: typeof supportKnowledgeCategory.$inferSelect): KnowledgeCategory {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      parentId: row.parentId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapArticle(row: typeof supportKnowledgeArticle.$inferSelect): KnowledgeArticle {
    return {
      id: row.id,
      categoryId: row.categoryId,
      title: row.title,
      content: row.content,
      status: row.status as KnowledgeArticle["status"],
      version: row.version,
      relatedArticles: row.relatedArticles as string[] | undefined,
      publishedAt: row.publishedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    };
  }
}
