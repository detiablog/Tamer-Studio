export type ArticleStatus = "draft" | "published" | "archived";

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  status: ArticleStatus;
  version: number;
  relatedArticles?: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
}

export interface CreateArticleInput {
  categoryId: string;
  title: string;
  content: string;
  relatedArticles?: string[];
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  categoryId?: string;
  status?: ArticleStatus;
  relatedArticles?: string[];
}

export interface ArticleFilter {
  categoryId?: string;
  status?: ArticleStatus;
  search?: string;
  limit?: number;
  offset?: number;
}
