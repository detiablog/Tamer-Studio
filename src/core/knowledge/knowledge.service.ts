import type { KnowledgeCategory, KnowledgeArticle, CreateCategoryInput, CreateArticleInput, UpdateArticleInput, ArticleFilter } from "./types";
import { KnowledgeRepository } from "./knowledge.repository";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

export class KnowledgeService {
  private repository = new KnowledgeRepository();

  constructor(private eventPublisher?: EventPublisher) {}

  async createCategory(input: CreateCategoryInput): Promise<KnowledgeCategory> {
    const category = await this.repository.createCategory(input);
    logger.info("Knowledge category created", { categoryId: category.id, name: category.name });
    return category;
  }

  async getCategories(): Promise<KnowledgeCategory[]> {
    return this.repository.getCategories();
  }

  async getCategory(id: string): Promise<KnowledgeCategory | undefined> {
    return this.repository.getCategory(id);
  }

  async createArticle(input: CreateArticleInput): Promise<KnowledgeArticle> {
    const article = await this.repository.createArticle({
      ...input,
      status: "draft",
    });

    logAction("knowledge.article.created", undefined, undefined, { articleId: article.id, categoryId: article.categoryId });
    logger.info("Knowledge article created", { articleId: article.id });

    return article;
  }

  async getArticle(id: string): Promise<KnowledgeArticle | undefined> {
    return this.repository.getArticle(id);
  }

  async listArticles(filter?: ArticleFilter): Promise<KnowledgeArticle[]> {
    return this.repository.listArticles(filter);
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<KnowledgeArticle | undefined> {
    const existing = await this.repository.getArticle(id);
    if (!existing) return undefined;

    const article = await this.repository.updateArticle(id, input);

    if (article) {
      logAction("knowledge.article.updated", undefined, undefined, { articleId: id, changes: input });
      logger.info("Knowledge article updated", { articleId: id });

      if (input.status === "published" && this.eventPublisher) {
        await this.eventPublisher.publishDomainEvent("knowledge.article.published", { articleId: id, categoryId: article.categoryId }, "support", { resourceId: id, resourceType: "knowledge_article" });
      }
    }

    return article;
  }

  async publishArticle(id: string): Promise<KnowledgeArticle | undefined> {
    return this.updateArticle(id, { status: "published" });
  }

  async archiveArticle(id: string): Promise<KnowledgeArticle | undefined> {
    const article = await this.repository.updateArticle(id, { status: "archived" });

    if (article) {
      logAction("knowledge.article.archived", undefined, undefined, { articleId: id });
      logger.info("Knowledge article archived", { articleId: id });
    }

    return article;
  }

  async getRelatedArticles(articleId: string, limit = 10): Promise<KnowledgeArticle[]> {
    return this.repository.getRelatedArticles(articleId, limit);
  }

  async softDeleteArticle(id: string): Promise<void> {
    await this.repository.softDeleteArticle(id);
    logAction("knowledge.article.archived", undefined, undefined, { articleId: id });
    logger.info("Knowledge article archived", { articleId: id });
  }
}
