import { db } from "@/lib/db";
import { imageProject, imageGeneration, imageStyle, imageCharacter, imagePromptLibrary, imageTemplate } from "@/lib/db/schema/image-studio";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ImageStudioService {
  async listProjects(userId: string, filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(imageProject.userId, userId)];
    if (filters?.status) conditions.push(eq(imageProject.status, filters.status));
    if (filters?.search) conditions.push(like(imageProject.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(imageProject).where(where).orderBy(desc(imageProject.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(imageProject).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createProject(userId: string, data: { name: string; description?: string; tags?: string[] }) {
    const id = generateId("iprj");
    return db.insert(imageProject).values({ ...data, id, userId, tags: data.tags || [] }).returning().then(r => r[0]);
  }

  async getProject(id: string) {
    const [item] = await db.select().from(imageProject).where(eq(imageProject.id, id)).limit(1);
    return item || null;
  }

  async updateProject(id: string, data: Record<string, unknown>) {
    return db.update(imageProject).set(data).where(eq(imageProject.id, id)).returning().then(r => r[0]);
  }

  async deleteProject(id: string) {
    await db.delete(imageProject).where(eq(imageProject.id, id));
  }

  async listGenerations(userId: string, filters?: { projectId?: string; type?: string; status?: string; isFavorite?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(imageGeneration.userId, userId)];
    if (filters?.projectId) conditions.push(eq(imageGeneration.projectId, filters.projectId));
    if (filters?.type) conditions.push(eq(imageGeneration.type, filters.type));
    if (filters?.status) conditions.push(eq(imageGeneration.status, filters.status));
    if (filters?.isFavorite !== undefined) conditions.push(eq(imageGeneration.isFavorite, filters.isFavorite));
    if (filters?.search) conditions.push(like(imageGeneration.prompt, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(imageGeneration).where(where).orderBy(desc(imageGeneration.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(imageGeneration).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createGeneration(data: { userId: string; projectId?: string; prompt: string; negativePrompt?: string; type?: string; style?: string; aspectRatio?: string; resolution?: string; quality?: string; seed?: number; model?: string; provider?: string; characterId?: string; referenceImage?: string; batchCount?: number }) {
    const id = generateId("igen");
    return db.insert(imageGeneration).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getGeneration(id: string) {
    const [item] = await db.select().from(imageGeneration).where(eq(imageGeneration.id, id)).limit(1);
    return item || null;
  }

  async updateGeneration(id: string, data: Record<string, unknown>) {
    return db.update(imageGeneration).set(data).where(eq(imageGeneration.id, id)).returning().then(r => r[0]);
  }

  async toggleFavorite(id: string) {
    const [item] = await db.select({ isFavorite: imageGeneration.isFavorite }).from(imageGeneration).where(eq(imageGeneration.id, id)).limit(1);
    if (item) {
      await db.update(imageGeneration).set({ isFavorite: !item.isFavorite }).where(eq(imageGeneration.id, id));
      return !item.isFavorite;
    }
    return false;
  }

  async deleteGeneration(id: string) {
    await db.delete(imageGeneration).where(eq(imageGeneration.id, id));
  }

  async listStyles(filters?: { category?: string; isActive?: boolean }) {
    const conditions = [];
    if (filters?.category) conditions.push(eq(imageStyle.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(imageStyle.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(imageStyle).where(where).orderBy(imageStyle.name);
  }

  async listCharacters(userId: string) {
    return db.select().from(imageCharacter).where(eq(imageCharacter.userId, userId)).orderBy(imageCharacter.name);
  }

  async createCharacter(userId: string, data: { name: string; description?: string; style?: string; promptTags?: string[]; defaultSettings?: Record<string, unknown> }) {
    const id = generateId("ichar");
    return db.insert(imageCharacter).values({ ...data, id, userId, promptTags: data.promptTags || [], defaultSettings: data.defaultSettings || {} }).returning().then(r => r[0]);
  }

  async listPromptLibrary(userId: string, filters?: { category?: string; search?: string }) {
    const conditions = [eq(imagePromptLibrary.userId, userId)];
    if (filters?.category) conditions.push(eq(imagePromptLibrary.category, filters.category));
    if (filters?.search) conditions.push(like(imagePromptLibrary.name, `%${filters.search}%`));
    return db.select().from(imagePromptLibrary).where(and(...conditions)).orderBy(desc(imagePromptLibrary.useCount));
  }

  async createPrompt(userId: string, data: { name: string; prompt: string; category?: string; tags?: string[] }) {
    const id = generateId("iprm");
    return db.insert(imagePromptLibrary).values({ ...data, id, userId, tags: data.tags || [] }).returning().then(r => r[0]);
  }

  async listTemplates(filters?: { category?: string; isSystem?: boolean }) {
    const conditions = [];
    if (filters?.category) conditions.push(eq(imageTemplate.category, filters.category));
    if (filters?.isSystem !== undefined) conditions.push(eq(imageTemplate.isSystem, filters.isSystem));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(imageTemplate).where(where).orderBy(imageTemplate.name);
  }

  async getStats(userId: string) {
    const conditions = [eq(imageGeneration.userId, userId)];
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(imageGeneration).where(and(...conditions));
    const [completed] = await db.select({ count: sql<number>`count(*)` }).from(imageGeneration).where(and(...conditions, eq(imageGeneration.status, "completed")));
    const [favorite] = await db.select({ count: sql<number>`count(*)` }).from(imageGeneration).where(and(...conditions, eq(imageGeneration.isFavorite, true)));
    const [projects] = await db.select({ count: sql<number>`count(*)` }).from(imageProject).where(eq(imageProject.userId, userId));
    const [totalCredits] = await db.select({ sum: sql<number>`coalesce(sum(${imageGeneration.creditsUsed}), 0)` }).from(imageGeneration).where(and(...conditions));
    return {
      totalGenerations: Number(total?.count ?? 0),
      completedGenerations: Number(completed?.count ?? 0),
      favoriteGenerations: Number(favorite?.count ?? 0),
      totalProjects: Number(projects?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.sum ?? 0),
    };
  }
}

export const imageStudioService = new ImageStudioService();
