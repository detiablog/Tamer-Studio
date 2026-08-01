import { db } from "@/lib/db";
import {
  promptLibrary,
  promptCollections,
  promptVersions,
  promptVariables,
  promptHistory,
} from "@/lib/db/schema/prompt-intelligence";
import { eq, and, desc, sql, like, or, type SQL } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PromptLibraryService {
  async listPrompts(userId: string, filters?: { type?: string; category?: string; search?: string; collectionId?: string; isFavorite?: boolean; isPinned?: boolean; isArchived?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions: SQL<unknown>[] = [eq(promptLibrary.userId, userId)];
    if (filters?.type) conditions.push(eq(promptLibrary.type, filters.type));
    if (filters?.category) conditions.push(eq(promptLibrary.category, filters.category));
    if (filters?.collectionId) conditions.push(eq(promptLibrary.collectionId, filters.collectionId));
    if (filters?.isFavorite !== undefined) conditions.push(eq(promptLibrary.isFavorite, filters.isFavorite));
    if (filters?.isPinned !== undefined) conditions.push(eq(promptLibrary.isPinned, filters.isPinned));
    if (filters?.isArchived !== undefined) conditions.push(eq(promptLibrary.isArchived, filters.isArchived));
    if (filters?.search) conditions.push(or(like(promptLibrary.name, `%${filters.search}%`), like(promptLibrary.content, `%${filters.search}%`))!);
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(promptLibrary).where(where).orderBy(desc(promptLibrary.isPinned), desc(promptLibrary.updatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(promptLibrary).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createPrompt(userId: string, data: { name: string; description?: string; content: string; type?: string; category?: string; tags?: string[]; variables?: string[]; collectionId?: string; isPublic?: boolean }) {
    const id = generateId("pprm");
    return db.insert(promptLibrary).values({ ...data, id, userId, versionNumber: 1 }).returning().then(r => r[0]);
  }

  async getPrompt(id: string) {
    const [item] = await db.select().from(promptLibrary).where(eq(promptLibrary.id, id)).limit(1);
    return item || null;
  }

  async updatePrompt(id: string, data: Record<string, unknown>) {
    const prompt = await this.getPrompt(id);
    if (prompt) {
      const { content, ...restData } = data as { content?: string; [key: string]: unknown };
      if (content && content !== prompt.content) {
        await this.createVersion(id, prompt.userId, content, prompt.versionNumber + 1, "Updated content");
        await db.update(promptLibrary).set({ content, versionNumber: sql`${promptLibrary.versionNumber} + 1`, ...restData, updatedAt: new Date() }).where(eq(promptLibrary.id, id));
      } else {
        await db.update(promptLibrary).set({ ...data, updatedAt: new Date() }).where(eq(promptLibrary.id, id));
      }
    }
    return this.getPrompt(id);
  }

  async deletePrompt(id: string) {
    await db.delete(promptVersions).where(eq(promptVersions.promptId, id));
    await db.delete(promptLibrary).where(eq(promptLibrary.id, id));
  }

  async toggleFavorite(id: string, isFavorite: boolean) {
    return db.update(promptLibrary).set({ isFavorite }).where(eq(promptLibrary.id, id)).returning().then(r => r[0]);
  }

  async togglePin(id: string, isPinned: boolean) {
    return db.update(promptLibrary).set({ isPinned }).where(eq(promptLibrary.id, id)).returning().then(r => r[0]);
  }

  async toggleArchive(id: string, isArchived: boolean) {
    return db.update(promptLibrary).set({ isArchived }).where(eq(promptLibrary.id, id)).returning().then(r => r[0]);
  }

  async incrementUseCount(id: string) {
    return db.update(promptLibrary).set({ useCount: sql`${promptLibrary.useCount} + 1` }).where(eq(promptLibrary.id, id)).returning().then(r => r[0]);
  }

  async listCollections(userId: string) {
    return db.select().from(promptCollections).where(eq(promptCollections.userId, userId)).orderBy(desc(promptCollections.isPinned), promptCollections.name);
  }

  async createCollection(userId: string, data: { name: string; description?: string; color?: string }) {
    const id = generateId("pcol");
    return db.insert(promptCollections).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async updateCollection(id: string, data: Record<string, unknown>) {
    return db.update(promptCollections).set(data).where(eq(promptCollections.id, id)).returning().then(r => r[0]);
  }

  async deleteCollection(id: string) {
    await db.update(promptLibrary).set({ collectionId: null }).where(eq(promptLibrary.collectionId, id));
    await db.delete(promptCollections).where(eq(promptCollections.id, id));
  }

  async createVersion(promptId: string, userId: string, content: string, versionNumber: number, changes?: string) {
    const id = generateId("pver");
    return db.insert(promptVersions).values({ id, promptId, userId, content, versionNumber, changes }).returning().then(r => r[0]);
  }

  async listVersions(promptId: string) {
    return db.select().from(promptVersions).where(eq(promptVersions.promptId, promptId)).orderBy(desc(promptVersions.versionNumber));
  }

  async getVersion(id: string) {
    const [item] = await db.select().from(promptVersions).where(eq(promptVersions.id, id)).limit(1);
    return item || null;
  }

  async rollbackVersion(id: string, versionId: string) {
    const prompt = await this.getPrompt(id);
    const version = await this.getVersion(versionId);
    if (!prompt || !version) return null;
    if (version.promptId !== id) return null;
    return db.update(promptLibrary).set({ content: version.content, versionNumber: sql`${promptLibrary.versionNumber} + 1`, updatedAt: new Date() }).where(eq(promptLibrary.id, id)).returning().then(r => r[0]);
  }

  async getStats(userId: string) {
    const [totalPrompts] = await db.select({ count: sql<number>`count(*)` }).from(promptLibrary).where(eq(promptLibrary.userId, userId));
    const [favoritePrompts] = await db.select({ count: sql<number>`count(*)` }).from(promptLibrary).where(and(eq(promptLibrary.userId, userId), eq(promptLibrary.isFavorite, true)));
    const [totalCollections] = await db.select({ count: sql<number>`count(*)` }).from(promptCollections).where(eq(promptCollections.userId, userId));
    const [totalVariables] = await db.select({ count: sql<number>`count(*)` }).from(promptVariables).where(eq(promptVariables.userId, userId));
    const [totalHistory] = await db.select({ count: sql<number>`count(*)` }).from(promptHistory).where(eq(promptHistory.userId, userId));
    const [totalVersions] = await db.select({ count: sql<number>`count(*)` }).from(promptVersions).where(eq(promptVersions.userId, userId));
    const typeCounts = await db.select({ type: promptLibrary.type, count: sql<number>`count(*)` }).from(promptLibrary).where(eq(promptLibrary.userId, userId)).groupBy(promptLibrary.type);

    return {
      totalPrompts: Number(totalPrompts?.count ?? 0),
      favoritePrompts: Number(favoritePrompts?.count ?? 0),
      totalCollections: Number(totalCollections?.count ?? 0),
      totalVariables: Number(totalVariables?.count ?? 0),
      totalHistory: Number(totalHistory?.count ?? 0),
      totalVersions: Number(totalVersions?.count ?? 0),
      typeCounts,
    };
  }
}

export const promptLibraryService = new PromptLibraryService();
