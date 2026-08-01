import { db } from "@/lib/db";
import { story, storyCharacter, storyLocation, storyRelationship, storyEvent, storyEpisode, storyRule } from "@/lib/db/schema/story-engine";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class StoryEngineService {
  async listStories(userId: string, filters?: { status?: string; genre?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(story.userId, userId)];
    if (filters?.status) conditions.push(eq(story.status, filters.status));
    if (filters?.genre) conditions.push(eq(story.genre, filters.genre));
    if (filters?.search) conditions.push(like(story.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(story).where(where).orderBy(desc(story.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(story).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createStory(userId: string, data: { title: string; projectId?: string; genre?: string; theme?: string; synopsis?: string; targetAudience?: string; tone?: string; narrativeStyle?: string; language?: string; metadata?: Record<string, unknown>; storyRules?: string[]; keywords?: string[] }) {
    const id = generateId("stry");
    return db.insert(story).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getStory(id: string) {
    const [item] = await db.select().from(story).where(eq(story.id, id)).limit(1);
    return item || null;
  }

  async updateStory(id: string, data: Record<string, unknown>) {
    return db.update(story).set(data).where(eq(story.id, id)).returning().then(r => r[0]);
  }

  async deleteStory(id: string) {
    await db.delete(story).where(eq(story.id, id));
  }

  async listCharacters(storyId: string, filters?: { role?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storyCharacter.storyId, storyId)];
    if (filters?.role) conditions.push(eq(storyCharacter.role, filters.role));
    if (filters?.search) conditions.push(like(storyCharacter.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(storyCharacter).where(where).orderBy(desc(storyCharacter.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storyCharacter).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCharacter(data: { storyId: string; name: string; aliases?: string[]; role?: string; age?: number; occupation?: string; personality?: string; goals?: string; motivation?: string; fear?: string; weakness?: string; strength?: string; speechStyle?: string; appearance?: string; outfits?: string[]; voice?: string; background?: string; currentStatus?: string; avatar?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("schr");
    return db.insert(storyCharacter).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getCharacter(id: string) {
    const [item] = await db.select().from(storyCharacter).where(eq(storyCharacter.id, id)).limit(1);
    return item || null;
  }

  async updateCharacter(id: string, data: Record<string, unknown>) {
    return db.update(storyCharacter).set(data).where(eq(storyCharacter.id, id)).returning().then(r => r[0]);
  }

  async deleteCharacter(id: string) {
    await db.delete(storyCharacter).where(eq(storyCharacter.id, id));
  }

  async listLocations(storyId: string, filters?: { search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storyLocation.storyId, storyId)];
    if (filters?.search) conditions.push(like(storyLocation.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(storyLocation).where(where).orderBy(desc(storyLocation.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storyLocation).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createLocation(data: { storyId: string; name: string; type?: string; description?: string; lighting?: string; weather?: string; history?: string; referenceImages?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("sloc");
    return db.insert(storyLocation).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getLocation(id: string) {
    const [item] = await db.select().from(storyLocation).where(eq(storyLocation.id, id)).limit(1);
    return item || null;
  }

  async updateLocation(id: string, data: Record<string, unknown>) {
    return db.update(storyLocation).set(data).where(eq(storyLocation.id, id)).returning().then(r => r[0]);
  }

  async deleteLocation(id: string) {
    await db.delete(storyLocation).where(eq(storyLocation.id, id));
  }

  async listRelationships(storyId: string, filters?: { search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storyRelationship.storyId, storyId)];
    if (filters?.search) conditions.push(like(storyRelationship.description, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(storyRelationship).where(where).orderBy(desc(storyRelationship.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storyRelationship).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRelationship(data: { storyId: string; characterAId: string; characterBId: string; type?: string; level?: string; description?: string; history?: Array<{ event: string; timestamp: string }>; metadata?: Record<string, unknown> }) {
    const id = generateId("srel");
    return db.insert(storyRelationship).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getRelationship(id: string) {
    const [item] = await db.select().from(storyRelationship).where(eq(storyRelationship.id, id)).limit(1);
    return item || null;
  }

  async updateRelationship(id: string, data: Record<string, unknown>) {
    return db.update(storyRelationship).set(data).where(eq(storyRelationship.id, id)).returning().then(r => r[0]);
  }

  async deleteRelationship(id: string) {
    await db.delete(storyRelationship).where(eq(storyRelationship.id, id));
  }

  async listEvents(storyId: string, filters?: { type?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storyEvent.storyId, storyId)];
    if (filters?.type) conditions.push(eq(storyEvent.type, filters.type));
    if (filters?.search) conditions.push(like(storyEvent.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(storyEvent).where(where).orderBy(desc(storyEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storyEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createEvent(data: { storyId: string; title: string; description?: string; type?: string; chapter?: number; scene?: number; characters?: string[]; location?: string; emotion?: string; importance?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("sevt");
    return db.insert(storyEvent).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getEvent(id: string) {
    const [item] = await db.select().from(storyEvent).where(eq(storyEvent.id, id)).limit(1);
    return item || null;
  }

  async updateEvent(id: string, data: Record<string, unknown>) {
    return db.update(storyEvent).set(data).where(eq(storyEvent.id, id)).returning().then(r => r[0]);
  }

  async deleteEvent(id: string) {
    await db.delete(storyEvent).where(eq(storyEvent.id, id));
  }

  async listEpisodes(storyId: string, filters?: { season?: number; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storyEpisode.storyId, storyId)];
    if (filters?.season) conditions.push(eq(storyEpisode.season, filters.season));
    if (filters?.status) conditions.push(eq(storyEpisode.status, filters.status));
    if (filters?.search) conditions.push(like(storyEpisode.title, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(storyEpisode).where(where).orderBy(desc(storyEpisode.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storyEpisode).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createEpisode(data: { storyId: string; episodeNumber: number; season?: number; title: string; synopsis?: string; summary?: string; status?: string; charactersUsed?: string[]; locationsUsed?: string[]; importantEvents?: string[]; emotionalState?: string; openQuestions?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("sepi");
    return db.insert(storyEpisode).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getEpisode(id: string) {
    const [item] = await db.select().from(storyEpisode).where(eq(storyEpisode.id, id)).limit(1);
    return item || null;
  }

  async updateEpisode(id: string, data: Record<string, unknown>) {
    return db.update(storyEpisode).set(data).where(eq(storyEpisode.id, id)).returning().then(r => r[0]);
  }

  async deleteEpisode(id: string) {
    await db.delete(storyEpisode).where(eq(storyEpisode.id, id));
  }

  async listRules(storyId: string, filters?: { category?: string; isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(storyRule.storyId, storyId)];
    if (filters?.category) conditions.push(eq(storyRule.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(storyRule.isActive, filters.isActive));
    if (filters?.search) conditions.push(like(storyRule.rule, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(storyRule).where(where).orderBy(desc(storyRule.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(storyRule).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createRule(data: { storyId: string; rule: string; category?: string; isActive?: boolean }) {
    const id = generateId("srlu");
    return db.insert(storyRule).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getRule(id: string) {
    const [item] = await db.select().from(storyRule).where(eq(storyRule.id, id)).limit(1);
    return item || null;
  }

  async updateRule(id: string, data: Record<string, unknown>) {
    return db.update(storyRule).set(data).where(eq(storyRule.id, id)).returning().then(r => r[0]);
  }

  async deleteRule(id: string) {
    await db.delete(storyRule).where(eq(storyRule.id, id));
  }

  async getStats(userId: string) {
    const conditions = [eq(story.userId, userId)];
    const [totalStories] = await db.select({ count: sql<number>`count(*)` }).from(story).where(and(...conditions));
    const [publishedStories] = await db.select({ count: sql<number>`count(*)` }).from(story).where(and(...conditions, eq(story.status, "published")));
    const [totalCharacters] = await db.select({ count: sql<number>`count(*)` }).from(storyCharacter).innerJoin(story, eq(storyCharacter.storyId, story.id)).where(and(...conditions));
    const [totalLocations] = await db.select({ count: sql<number>`count(*)` }).from(storyLocation).innerJoin(story, eq(storyLocation.storyId, story.id)).where(and(...conditions));
    const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(storyEvent).innerJoin(story, eq(storyEvent.storyId, story.id)).where(and(...conditions));
    const [totalEpisodes] = await db.select({ count: sql<number>`count(*)` }).from(storyEpisode).innerJoin(story, eq(storyEpisode.storyId, story.id)).where(and(...conditions));
    const [totalRelationships] = await db.select({ count: sql<number>`count(*)` }).from(storyRelationship).innerJoin(story, eq(storyRelationship.storyId, story.id)).where(and(...conditions));
    const [totalRules] = await db.select({ count: sql<number>`count(*)` }).from(storyRule).innerJoin(story, eq(storyRule.storyId, story.id)).where(and(...conditions));
    return {
      totalStories: Number(totalStories?.count ?? 0),
      publishedStories: Number(publishedStories?.count ?? 0),
      totalCharacters: Number(totalCharacters?.count ?? 0),
      totalLocations: Number(totalLocations?.count ?? 0),
      totalEvents: Number(totalEvents?.count ?? 0),
      totalEpisodes: Number(totalEpisodes?.count ?? 0),
      totalRelationships: Number(totalRelationships?.count ?? 0),
      totalRules: Number(totalRules?.count ?? 0),
    };
  }
}

export const storyEngineService = new StoryEngineService();
