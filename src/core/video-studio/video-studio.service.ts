import { db } from "@/lib/db";
import { videoProject, videoStoryboard, videoScene, videoGeneration, videoTemplate, videoEffect, videoTransition } from "@/lib/db/schema/video-studio";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class VideoStudioService {
  async listProjects(userId: string, filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(videoProject.userId, userId)];
    if (filters?.status) conditions.push(eq(videoProject.status, filters.status));
    if (filters?.search) conditions.push(like(videoProject.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(videoProject).where(where).orderBy(desc(videoProject.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(videoProject).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createProject(userId: string, data: { name: string; description?: string; coverImage?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("vprj");
    return db.insert(videoProject).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getProject(id: string) {
    const [item] = await db.select().from(videoProject).where(eq(videoProject.id, id)).limit(1);
    return item || null;
  }

  async updateProject(id: string, data: Record<string, unknown>) {
    return db.update(videoProject).set(data).where(eq(videoProject.id, id)).returning().then(r => r[0]);
  }

  async deleteProject(id: string) {
    await db.delete(videoProject).where(eq(videoProject.id, id));
  }

  async listStoryboards(userId: string, filters?: { projectId?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(videoStoryboard.userId, userId)];
    if (filters?.projectId) conditions.push(eq(videoStoryboard.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(videoStoryboard.status, filters.status));
    if (filters?.search) conditions.push(like(videoStoryboard.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(videoStoryboard).where(where).orderBy(desc(videoStoryboard.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(videoStoryboard).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createStoryboard(userId: string, data: { projectId: string; name: string; description?: string; settings?: Record<string, unknown> }) {
    const id = generateId("vsb");
    return db.insert(videoStoryboard).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getStoryboard(id: string) {
    const [item] = await db.select().from(videoStoryboard).where(eq(videoStoryboard.id, id)).limit(1);
    return item || null;
  }

  async updateStoryboard(id: string, data: Record<string, unknown>) {
    return db.update(videoStoryboard).set(data).where(eq(videoStoryboard.id, id)).returning().then(r => r[0]);
  }

  async deleteStoryboard(id: string) {
    await db.delete(videoStoryboard).where(eq(videoStoryboard.id, id));
  }

  async listScenes(storyboardId: string, filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const where = eq(videoScene.storyboardId, storyboardId);
    const [data, total] = await Promise.all([
      db.select().from(videoScene).where(where).orderBy(videoScene.order).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(videoScene).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createScene(data: { storyboardId: string; order?: number; title?: string; prompt: string; negativePrompt?: string; duration?: number; cameraMotion?: string; transition?: string; characters?: string[]; audio?: Record<string, unknown>; subtitles?: Array<{ text: string; startTime: number; endTime: number }>; effects?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("vsc");
    return db.insert(videoScene).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getScene(id: string) {
    const [item] = await db.select().from(videoScene).where(eq(videoScene.id, id)).limit(1);
    return item || null;
  }

  async updateScene(id: string, data: Record<string, unknown>) {
    return db.update(videoScene).set(data).where(eq(videoScene.id, id)).returning().then(r => r[0]);
  }

  async deleteScene(id: string) {
    await db.delete(videoScene).where(eq(videoScene.id, id));
  }

  async listGenerations(userId: string, filters?: { projectId?: string; storyboardId?: string; type?: string; status?: string; isFavorite?: boolean; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(videoGeneration.userId, userId)];
    if (filters?.projectId) conditions.push(eq(videoGeneration.projectId, filters.projectId));
    if (filters?.storyboardId) conditions.push(eq(videoGeneration.storyboardId, filters.storyboardId));
    if (filters?.type) conditions.push(eq(videoGeneration.type, filters.type));
    if (filters?.status) conditions.push(eq(videoGeneration.status, filters.status));
    if (filters?.isFavorite !== undefined) conditions.push(eq(videoGeneration.isFavorite, filters.isFavorite));
    if (filters?.search) conditions.push(like(videoGeneration.prompt, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(videoGeneration).where(where).orderBy(desc(videoGeneration.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(videoGeneration).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createGeneration(data: { userId: string; projectId?: string; storyboardId?: string; sceneId?: string; type?: string; prompt: string; negativePrompt?: string; style?: string; aspectRatio?: string; resolution?: string; frameRate?: number; duration?: number; quality?: string; seed?: number; model?: string; provider?: string; referenceImage?: string; referenceVideo?: string }) {
    const id = generateId("vgen");
    return db.insert(videoGeneration).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getGeneration(id: string) {
    const [item] = await db.select().from(videoGeneration).where(eq(videoGeneration.id, id)).limit(1);
    return item || null;
  }

  async updateGeneration(id: string, data: Record<string, unknown>) {
    return db.update(videoGeneration).set(data).where(eq(videoGeneration.id, id)).returning().then(r => r[0]);
  }

  async toggleFavorite(id: string) {
    const [item] = await db.select({ isFavorite: videoGeneration.isFavorite }).from(videoGeneration).where(eq(videoGeneration.id, id)).limit(1);
    if (item) {
      await db.update(videoGeneration).set({ isFavorite: !item.isFavorite }).where(eq(videoGeneration.id, id));
      return !item.isFavorite;
    }
    return false;
  }

  async deleteGeneration(id: string) {
    await db.delete(videoGeneration).where(eq(videoGeneration.id, id));
  }

  async listTemplates(filters?: { category?: string; isSystem?: boolean; isActive?: boolean }) {
    const conditions = [];
    if (filters?.category) conditions.push(eq(videoTemplate.category, filters.category));
    if (filters?.isSystem !== undefined) conditions.push(eq(videoTemplate.isSystem, filters.isSystem));
    if (filters?.isActive !== undefined) conditions.push(eq(videoTemplate.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(videoTemplate).where(where).orderBy(videoTemplate.name);
  }

  async createTemplate(data: { name: string; description?: string; category?: string; settings?: Record<string, unknown>; scenes?: Record<string, unknown>[]; thumbnail?: string; isSystem?: boolean }) {
    const id = generateId("vtpl");
    return db.insert(videoTemplate).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getTemplate(id: string) {
    const [item] = await db.select().from(videoTemplate).where(eq(videoTemplate.id, id)).limit(1);
    return item || null;
  }

  async updateTemplate(id: string, data: Record<string, unknown>) {
    return db.update(videoTemplate).set(data).where(eq(videoTemplate.id, id)).returning().then(r => r[0]);
  }

  async deleteTemplate(id: string) {
    await db.delete(videoTemplate).where(eq(videoTemplate.id, id));
  }

  async listEffects(filters?: { category?: string; isActive?: boolean }) {
    const conditions = [];
    if (filters?.category) conditions.push(eq(videoEffect.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(videoEffect.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(videoEffect).where(where).orderBy(videoEffect.name);
  }

  async createEffect(data: { name: string; category?: string; config?: Record<string, unknown>; isSystem?: boolean }) {
    const id = generateId("vefx");
    return db.insert(videoEffect).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateEffect(id: string, data: Record<string, unknown>) {
    return db.update(videoEffect).set(data).where(eq(videoEffect.id, id)).returning().then(r => r[0]);
  }

  async deleteEffect(id: string) {
    await db.delete(videoEffect).where(eq(videoEffect.id, id));
  }

  async listTransitions(filters?: { category?: string; isActive?: boolean }) {
    const conditions = [];
    if (filters?.category) conditions.push(eq(videoTransition.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(videoTransition.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(videoTransition).where(where).orderBy(videoTransition.name);
  }

  async createTransition(data: { name: string; category?: string; duration?: number; config?: Record<string, unknown>; isSystem?: boolean }) {
    const id = generateId("vtrn");
    return db.insert(videoTransition).values({ ...data, id }).returning().then(r => r[0]);
  }

  async updateTransition(id: string, data: Record<string, unknown>) {
    return db.update(videoTransition).set(data).where(eq(videoTransition.id, id)).returning().then(r => r[0]);
  }

  async deleteTransition(id: string) {
    await db.delete(videoTransition).where(eq(videoTransition.id, id));
  }

  async getStats(userId: string) {
    const conditions = [eq(videoGeneration.userId, userId)];
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(videoGeneration).where(and(...conditions));
    const [completed] = await db.select({ count: sql<number>`count(*)` }).from(videoGeneration).where(and(...conditions, eq(videoGeneration.status, "completed")));
    const [favorite] = await db.select({ count: sql<number>`count(*)` }).from(videoGeneration).where(and(...conditions, eq(videoGeneration.isFavorite, true)));
    const [projects] = await db.select({ count: sql<number>`count(*)` }).from(videoProject).where(eq(videoProject.userId, userId));
    const [storyboards] = await db.select({ count: sql<number>`count(*)` }).from(videoStoryboard).where(eq(videoStoryboard.userId, userId));
    const [totalCredits] = await db.select({ sum: sql<number>`coalesce(sum(${videoGeneration.creditsUsed}), 0)` }).from(videoGeneration).where(and(...conditions));
    return {
      totalGenerations: Number(total?.count ?? 0),
      completedGenerations: Number(completed?.count ?? 0),
      favoriteGenerations: Number(favorite?.count ?? 0),
      totalProjects: Number(projects?.count ?? 0),
      totalStoryboards: Number(storyboards?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.sum ?? 0),
    };
  }
}

export const videoStudioService = new VideoStudioService();
