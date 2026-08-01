import { db } from "@/lib/db";
import {
  creativeMemory,
  creativeBrandProfile,
  creativePreference,
  creativeLearningEvent,
  creativeVisualMemory,
  creativeStoryMemory,
  creativeCharacterMemory,
  creativeThumbnailMemory,
  creativeCaptionMemory,
  creativeWorkflowMemory,
  creativeGenerationMemory,
  creativePublishingMemory,
  creativeMemorySettings,
} from "@/lib/db/schema/creative-memory";
import { eq, and, desc, sql, like, inArray } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class CreativeMemoryService {
  async listMemories(userId: string, filters?: { category?: string; search?: string; pinnedOnly?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeMemory.userId, userId)];
    if (filters?.category) conditions.push(eq(creativeMemory.category, filters.category));
    if (filters?.search) conditions.push(like(creativeMemory.content, `%${filters.search}%`));
    if (filters?.pinnedOnly) conditions.push(eq(creativeMemory.isPinned, true));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeMemory).where(where).orderBy(desc(creativeMemory.score), desc(creativeMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createMemory(userId: string, data: { category: string; key: string; content?: string; data?: Record<string, unknown>; source?: string; score?: number; isPinned?: boolean; isSystem?: boolean; metadata?: Record<string, unknown>; expiresAt?: Date }) {
    const id = generateId("cmem");
    return db.insert(creativeMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getMemory(id: string) {
    const [item] = await db.select().from(creativeMemory).where(eq(creativeMemory.id, id)).limit(1);
    return item || null;
  }

  async updateMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeMemory).set(data).where(eq(creativeMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteMemory(id: string) {
    await db.delete(creativeMemory).where(eq(creativeMemory.id, id));
  }

  async searchMemories(userId: string, query: string, categories?: string[]) {
    const conditions = [eq(creativeMemory.userId, userId), like(creativeMemory.content, `%${query}%`)];
    if (categories && categories.length > 0) {
      conditions.push(inArray(creativeMemory.category, categories));
    }
    return db.select().from(creativeMemory).where(and(...conditions)).orderBy(desc(creativeMemory.score));
  }

  async listBrandProfiles(userId: string) {
    return db.select().from(creativeBrandProfile).where(eq(creativeBrandProfile.userId, userId)).orderBy(desc(creativeBrandProfile.createdAt));
  }

  async createBrandProfile(userId: string, data: { name: string; logo?: string; primaryColors?: string[]; secondaryColors?: string[]; typography?: string; watermark?: string; voice?: string; tone?: string; audience?: string; preferredCta?: string; preferredPlatforms?: string[]; keywords?: string[]; rules?: string[]; brandStyleGuide?: Record<string, unknown>; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("cbpf");
    return db.insert(creativeBrandProfile).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getBrandProfile(id: string) {
    const [item] = await db.select().from(creativeBrandProfile).where(eq(creativeBrandProfile.id, id)).limit(1);
    return item || null;
  }

  async updateBrandProfile(id: string, data: Record<string, unknown>) {
    return db.update(creativeBrandProfile).set(data).where(eq(creativeBrandProfile.id, id)).returning().then(r => r[0]);
  }

  async deleteBrandProfile(id: string) {
    await db.delete(creativeBrandProfile).where(eq(creativeBrandProfile.id, id));
  }

  async listPreferences(userId: string, filters?: { category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativePreference.userId, userId)];
    if (filters?.category) conditions.push(eq(creativePreference.category, filters.category));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativePreference).where(where).orderBy(desc(creativePreference.confidence)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativePreference).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createPreference(userId: string, data: { category: string; key: string; value: string; confidence?: number; source?: string; isEditable?: boolean }) {
    const id = generateId("cpref");
    return db.insert(creativePreference).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getPreference(id: string) {
    const [item] = await db.select().from(creativePreference).where(eq(creativePreference.id, id)).limit(1);
    return item || null;
  }

  async updatePreference(id: string, data: Record<string, unknown>) {
    return db.update(creativePreference).set(data).where(eq(creativePreference.id, id)).returning().then(r => r[0]);
  }

  async deletePreference(id: string) {
    await db.delete(creativePreference).where(eq(creativePreference.id, id));
  }

  async listLearningEvents(userId: string, filters?: { eventType?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeLearningEvent.userId, userId)];
    if (filters?.eventType) conditions.push(eq(creativeLearningEvent.eventType, filters.eventType));
    if (filters?.category) conditions.push(eq(creativeLearningEvent.category, filters.category));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeLearningEvent).where(where).orderBy(desc(creativeLearningEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeLearningEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async recordLearningEvent(userId: string, data: { eventType: string; category?: string; entityId?: string; entityType?: string; data?: Record<string, unknown>; source?: string }) {
    const id = generateId("cle");
    return db.insert(creativeLearningEvent).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listStoryMemories(userId: string, filters?: { search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeStoryMemory.userId, userId)];
    if (filters?.search) conditions.push(like(creativeStoryMemory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeStoryMemory).where(where).orderBy(desc(creativeStoryMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeStoryMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createStoryMemory(userId: string, data: { storyId?: string; name: string; storyBible?: Record<string, unknown>; universe?: Record<string, unknown>; timeline?: Record<string, unknown>; dialogueStyle?: Record<string, unknown>; episodeStructure?: Record<string, unknown>; scenePattern?: Record<string, unknown>; storyRules?: string[]; genrePreferences?: string[]; endingStyle?: string; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("cstm");
    return db.insert(creativeStoryMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getStoryMemory(id: string) {
    const [item] = await db.select().from(creativeStoryMemory).where(eq(creativeStoryMemory.id, id)).limit(1);
    return item || null;
  }

  async updateStoryMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeStoryMemory).set(data).where(eq(creativeStoryMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteStoryMemory(id: string) {
    await db.delete(creativeStoryMemory).where(eq(creativeStoryMemory.id, id));
  }

  async listCharacterMemories(userId: string, filters?: { search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeCharacterMemory.userId, userId)];
    if (filters?.search) conditions.push(like(creativeCharacterMemory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeCharacterMemory).where(where).orderBy(desc(creativeCharacterMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeCharacterMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCharacterMemory(userId: string, data: { characterId?: string; name: string; appearance?: Record<string, unknown>; outfits?: Record<string, unknown>[]; expressions?: string[]; accessories?: string[]; voice?: string; relationships?: Record<string, unknown>[]; personality?: Record<string, unknown>; speechPattern?: Record<string, unknown>; visualReferences?: string[]; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("ccrm");
    return db.insert(creativeCharacterMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getCharacterMemory(id: string) {
    const [item] = await db.select().from(creativeCharacterMemory).where(eq(creativeCharacterMemory.id, id)).limit(1);
    return item || null;
  }

  async updateCharacterMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeCharacterMemory).set(data).where(eq(creativeCharacterMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteCharacterMemory(id: string) {
    await db.delete(creativeCharacterMemory).where(eq(creativeCharacterMemory.id, id));
  }

  async listWorkflowMemories(userId: string, filters?: { search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeWorkflowMemory.userId, userId)];
    if (filters?.search) conditions.push(like(creativeWorkflowMemory.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeWorkflowMemory).where(where).orderBy(desc(creativeWorkflowMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeWorkflowMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createWorkflowMemory(userId: string, data: { projectId?: string; name: string; frequentlyUsed?: Record<string, unknown>[]; favoriteTemplates?: string[]; automationRules?: Record<string, unknown>[]; generationOrder?: string[]; renderingPreferences?: Record<string, unknown>; publishingFlow?: Record<string, unknown>; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("cwfm");
    return db.insert(creativeWorkflowMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getWorkflowMemory(id: string) {
    const [item] = await db.select().from(creativeWorkflowMemory).where(eq(creativeWorkflowMemory.id, id)).limit(1);
    return item || null;
  }

  async updateWorkflowMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeWorkflowMemory).set(data).where(eq(creativeWorkflowMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteWorkflowMemory(id: string) {
    await db.delete(creativeWorkflowMemory).where(eq(creativeWorkflowMemory.id, id));
  }

  async listGenerationMemories(userId: string, filters?: { moduleType?: string; projectId?: string; isFavorite?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(creativeGenerationMemory.userId, userId)];
    if (filters?.moduleType) conditions.push(eq(creativeGenerationMemory.moduleType, filters.moduleType));
    if (filters?.projectId) conditions.push(eq(creativeGenerationMemory.projectId, filters.projectId));
    if (filters?.isFavorite !== undefined) conditions.push(eq(creativeGenerationMemory.isFavorite, filters.isFavorite));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(creativeGenerationMemory).where(where).orderBy(desc(creativeGenerationMemory.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(creativeGenerationMemory).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createGenerationMemory(userId: string, data: { projectId?: string; moduleType: string; prompt?: string; negativePrompt?: string; parameters?: Record<string, unknown>; result?: Record<string, unknown>; isFavorite?: boolean; performance?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
    const id = generateId("cgen");
    return db.insert(creativeGenerationMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getGenerationMemory(id: string) {
    const [item] = await db.select().from(creativeGenerationMemory).where(eq(creativeGenerationMemory.id, id)).limit(1);
    return item || null;
  }

  async updateGenerationMemory(id: string, data: Record<string, unknown>) {
    return db.update(creativeGenerationMemory).set(data).where(eq(creativeGenerationMemory.id, id)).returning().then(r => r[0]);
  }

  async deleteGenerationMemory(id: string) {
    await db.delete(creativeGenerationMemory).where(eq(creativeGenerationMemory.id, id));
  }

  async getPublishingMemory(userId: string) {
    const [item] = await db.select().from(creativePublishingMemory).where(eq(creativePublishingMemory.userId, userId)).limit(1);
    return item || null;
  }

  async upsertPublishingMemory(userId: string, data: { preferredPlatforms?: string[]; postingTime?: Record<string, unknown>; postingFrequency?: string; schedulingPattern?: Record<string, unknown>; campaignTiming?: Record<string, unknown>; timezone?: string; publishingStrategy?: Record<string, unknown>; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const existing = await this.getPublishingMemory(userId);
    if (existing) {
      return db.update(creativePublishingMemory).set(data).where(eq(creativePublishingMemory.id, existing.id)).returning().then(r => r[0]);
    }
    const id = generateId("cpub");
    return db.insert(creativePublishingMemory).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getSettings(userId: string) {
    const [item] = await db.select().from(creativeMemorySettings).where(eq(creativeMemorySettings.userId, userId)).limit(1);
    return item || null;
  }

  async upsertSettings(userId: string, data: { learningEnabled?: boolean; learningPaused?: boolean; maxMemories?: number; maxLearningEvents?: number; autoCleanup?: boolean; retentionDays?: number; categoryLimits?: Record<string, number>; excludedCategories?: string[]; metadata?: Record<string, unknown> }) {
    const existing = await this.getSettings(userId);
    if (existing) {
      return db.update(creativeMemorySettings).set(data).where(eq(creativeMemorySettings.id, existing.id)).returning().then(r => r[0]);
    }
    const id = generateId("cset");
    return db.insert(creativeMemorySettings).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getStats(userId: string) {
    const conditions = [eq(creativeMemory.userId, userId)];
    const prefConditions = [eq(creativePreference.userId, userId)];
    const eventConditions = [eq(creativeLearningEvent.userId, userId)];
    const brandConditions = [eq(creativeBrandProfile.userId, userId)];

    const [totalMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeMemory).where(and(...conditions));
    const [pinnedMemories] = await db.select({ count: sql<number>`count(*)` }).from(creativeMemory).where(and(...conditions, eq(creativeMemory.isPinned, true)));
    const [totalPreferences] = await db.select({ count: sql<number>`count(*)` }).from(creativePreference).where(and(...prefConditions));
    const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(creativeLearningEvent).where(and(...eventConditions));
    const [totalBrands] = await db.select({ count: sql<number>`count(*)` }).from(creativeBrandProfile).where(and(...brandConditions));
    const [totalVisual] = await db.select({ count: sql<number>`count(*)` }).from(creativeVisualMemory).where(eq(creativeVisualMemory.userId, userId));
    const [totalStories] = await db.select({ count: sql<number>`count(*)` }).from(creativeStoryMemory).where(eq(creativeStoryMemory.userId, userId));
    const [totalCharacters] = await db.select({ count: sql<number>`count(*)` }).from(creativeCharacterMemory).where(eq(creativeCharacterMemory.userId, userId));
    const [totalThumbnails] = await db.select({ count: sql<number>`count(*)` }).from(creativeThumbnailMemory).where(eq(creativeThumbnailMemory.userId, userId));
    const [totalCaptions] = await db.select({ count: sql<number>`count(*)` }).from(creativeCaptionMemory).where(eq(creativeCaptionMemory.userId, userId));
    const [totalWorkflows] = await db.select({ count: sql<number>`count(*)` }).from(creativeWorkflowMemory).where(eq(creativeWorkflowMemory.userId, userId));
    const [totalGenerations] = await db.select({ count: sql<number>`count(*)` }).from(creativeGenerationMemory).where(eq(creativeGenerationMemory.userId, userId));

    const categoryCounts = await db.select({
      category: creativeMemory.category,
      count: sql<number>`count(*)`,
    }).from(creativeMemory).where(and(...conditions)).groupBy(creativeMemory.category);

    return {
      totalMemories: Number(totalMemories?.count ?? 0),
      pinnedMemories: Number(pinnedMemories?.count ?? 0),
      totalPreferences: Number(totalPreferences?.count ?? 0),
      totalLearningEvents: Number(totalEvents?.count ?? 0),
      totalBrandProfiles: Number(totalBrands?.count ?? 0),
      totalVisualMemories: Number(totalVisual?.count ?? 0),
      totalStoryMemories: Number(totalStories?.count ?? 0),
      totalCharacterMemories: Number(totalCharacters?.count ?? 0),
      totalThumbnailMemories: Number(totalThumbnails?.count ?? 0),
      totalCaptionMemories: Number(totalCaptions?.count ?? 0),
      totalWorkflowMemories: Number(totalWorkflows?.count ?? 0),
      totalGenerationMemories: Number(totalGenerations?.count ?? 0),
      categoryCounts,
    };
  }

  async exportAll(userId: string) {
    const memories = await db.select().from(creativeMemory).where(eq(creativeMemory.userId, userId));
    const brands = await db.select().from(creativeBrandProfile).where(eq(creativeBrandProfile.userId, userId));
    const preferences = await db.select().from(creativePreference).where(eq(creativePreference.userId, userId));
    const events = await db.select().from(creativeLearningEvent).where(eq(creativeLearningEvent.userId, userId));
    const visuals = await db.select().from(creativeVisualMemory).where(eq(creativeVisualMemory.userId, userId));
    const stories = await db.select().from(creativeStoryMemory).where(eq(creativeStoryMemory.userId, userId));
    const characters = await db.select().from(creativeCharacterMemory).where(eq(creativeCharacterMemory.userId, userId));
    const thumbnails = await db.select().from(creativeThumbnailMemory).where(eq(creativeThumbnailMemory.userId, userId));
    const captions = await db.select().from(creativeCaptionMemory).where(eq(creativeCaptionMemory.userId, userId));
    const workflows = await db.select().from(creativeWorkflowMemory).where(eq(creativeWorkflowMemory.userId, userId));
    const generations = await db.select().from(creativeGenerationMemory).where(eq(creativeGenerationMemory.userId, userId));
    const publishing = await db.select().from(creativePublishingMemory).where(eq(creativePublishingMemory.userId, userId));
    const settings = await this.getSettings(userId);
    return { memories, brands, preferences, learningEvents: events, visuals, stories, characters, thumbnails, captions, workflows, generations, publishing, settings };
  }

  async importAll(userId: string, data: { memories?: Array<Record<string, unknown>>; brands?: Array<Record<string, unknown>>; preferences?: Array<Record<string, unknown>>; learningEvents?: Array<Record<string, unknown>>; visuals?: Array<Record<string, unknown>>; stories?: Array<Record<string, unknown>>; characters?: Array<Record<string, unknown>>; thumbnails?: Array<Record<string, unknown>>; captions?: Array<Record<string, unknown>>; workflows?: Array<Record<string, unknown>>; generations?: Array<Record<string, unknown>> }) {
    const results: Record<string, number> = {};

    if (data.memories && data.memories.length > 0) {
      const rows = data.memories.map((m) => ({ ...m, id: generateId("cmem"), userId }));
      await db.insert(creativeMemory).values(rows as any);
      results.memories = rows.length;
    }

    if (data.brands && data.brands.length > 0) {
      const rows = data.brands.map((b) => ({ ...b, id: generateId("cbpf"), userId }));
      await db.insert(creativeBrandProfile).values(rows as any);
      results.brands = rows.length;
    }

    if (data.preferences && data.preferences.length > 0) {
      const rows = data.preferences.map((p) => ({ ...p, id: generateId("cpref"), userId }));
      await db.insert(creativePreference).values(rows as any);
      results.preferences = rows.length;
    }

    if (data.learningEvents && data.learningEvents.length > 0) {
      const rows = data.learningEvents.map((e) => ({ ...e, id: generateId("cle"), userId }));
      await db.insert(creativeLearningEvent).values(rows as any);
      results.learningEvents = rows.length;
    }

    if (data.visuals && data.visuals.length > 0) {
      const rows = data.visuals.map((v) => ({ ...v, id: generateId("cvis"), userId }));
      await db.insert(creativeVisualMemory).values(rows as any);
      results.visuals = rows.length;
    }

    if (data.stories && data.stories.length > 0) {
      const rows = data.stories.map((s) => ({ ...s, id: generateId("cstm"), userId }));
      await db.insert(creativeStoryMemory).values(rows as any);
      results.stories = rows.length;
    }

    if (data.characters && data.characters.length > 0) {
      const rows = data.characters.map((c) => ({ ...c, id: generateId("ccrm"), userId }));
      await db.insert(creativeCharacterMemory).values(rows as any);
      results.characters = rows.length;
    }

    if (data.thumbnails && data.thumbnails.length > 0) {
      const rows = data.thumbnails.map((t) => ({ ...t, id: generateId("cthm"), userId }));
      await db.insert(creativeThumbnailMemory).values(rows as any);
      results.thumbnails = rows.length;
    }

    if (data.captions && data.captions.length > 0) {
      const rows = data.captions.map((c) => ({ ...c, id: generateId("ccap"), userId }));
      await db.insert(creativeCaptionMemory).values(rows as any);
      results.captions = rows.length;
    }

    if (data.workflows && data.workflows.length > 0) {
      const rows = data.workflows.map((w) => ({ ...w, id: generateId("cwfm"), userId }));
      await db.insert(creativeWorkflowMemory).values(rows as any);
      results.workflows = rows.length;
    }

    if (data.generations && data.generations.length > 0) {
      const rows = data.generations.map((g) => ({ ...g, id: generateId("cgen"), userId }));
      await db.insert(creativeGenerationMemory).values(rows as any);
      results.generations = rows.length;
    }

    return results;
  }

  async clearAllMemory(userId: string, options?: { categories?: string[] }) {
    if (options?.categories && options.categories.length > 0) {
      await db.delete(creativeMemory).where(and(eq(creativeMemory.userId, userId), inArray(creativeMemory.category, options.categories)));
    } else {
      await db.delete(creativeMemory).where(eq(creativeMemory.userId, userId));
      await db.delete(creativeBrandProfile).where(eq(creativeBrandProfile.userId, userId));
      await db.delete(creativePreference).where(eq(creativePreference.userId, userId));
      await db.delete(creativeVisualMemory).where(eq(creativeVisualMemory.userId, userId));
      await db.delete(creativeStoryMemory).where(eq(creativeStoryMemory.userId, userId));
      await db.delete(creativeCharacterMemory).where(eq(creativeCharacterMemory.userId, userId));
      await db.delete(creativeThumbnailMemory).where(eq(creativeThumbnailMemory.userId, userId));
      await db.delete(creativeCaptionMemory).where(eq(creativeCaptionMemory.userId, userId));
      await db.delete(creativeWorkflowMemory).where(eq(creativeWorkflowMemory.userId, userId));
      await db.delete(creativeGenerationMemory).where(eq(creativeGenerationMemory.userId, userId));
      await db.delete(creativePublishingMemory).where(eq(creativePublishingMemory.userId, userId));
      await db.delete(creativeLearningEvent).where(eq(creativeLearningEvent.userId, userId));
    }
  }
}

export const creativeMemoryService = new CreativeMemoryService();
