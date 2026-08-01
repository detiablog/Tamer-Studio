import { db } from "@/lib/db";
import { dramaProject, dramaUniverse, dramaCharacter, dramaLocation, dramaEpisode, dramaScene, dramaGenerationJob, dramaTemplate } from "@/lib/db/schema/drama-studio";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class DramaStudioService {
  async listProjects(userId: string, filters?: { status?: string; genre?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(dramaProject.userId, userId)];
    if (filters?.status) conditions.push(eq(dramaProject.status, filters.status));
    if (filters?.genre) conditions.push(eq(dramaProject.genre, filters.genre));
    if (filters?.search) conditions.push(like(dramaProject.name, `%${filters.search}%`));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(dramaProject).where(where).orderBy(desc(dramaProject.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaProject).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createProject(userId: string, data: { name: string; description?: string; genre?: string; coverImage?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("dprj");
    return db.insert(dramaProject).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getProject(id: string) {
    const [item] = await db.select().from(dramaProject).where(eq(dramaProject.id, id)).limit(1);
    return item || null;
  }

  async updateProject(id: string, data: Record<string, unknown>) {
    return db.update(dramaProject).set(data).where(eq(dramaProject.id, id)).returning().then(r => r[0]);
  }

  async deleteProject(id: string) {
    await db.delete(dramaProject).where(eq(dramaProject.id, id));
  }

  async listUniverses(userId: string, filters?: { projectId?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.projectId) conditions.push(eq(dramaUniverse.projectId, filters.projectId));
    if (filters?.search) conditions.push(like(dramaUniverse.name, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(dramaUniverse).where(where).orderBy(desc(dramaUniverse.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaUniverse).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createUniverse(data: { projectId: string; name: string; description?: string; timeline?: Array<{ era: string; events: string[] }>; rules?: Record<string, unknown>; locations?: string[]; lore?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("duniv");
    return db.insert(dramaUniverse).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getUniverse(id: string) {
    const [item] = await db.select().from(dramaUniverse).where(eq(dramaUniverse.id, id)).limit(1);
    return item || null;
  }

  async updateUniverse(id: string, data: Record<string, unknown>) {
    return db.update(dramaUniverse).set(data).where(eq(dramaUniverse.id, id)).returning().then(r => r[0]);
  }

  async deleteUniverse(id: string) {
    await db.delete(dramaUniverse).where(eq(dramaUniverse.id, id));
  }

  async listCharacters(userId: string, filters?: { projectId?: string; role?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.projectId) conditions.push(eq(dramaCharacter.projectId, filters.projectId));
    if (filters?.role) conditions.push(eq(dramaCharacter.role, filters.role));
    if (filters?.search) conditions.push(like(dramaCharacter.name, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(dramaCharacter).where(where).orderBy(desc(dramaCharacter.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaCharacter).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createCharacter(data: { projectId: string; name: string; role?: string; description?: string; personality?: string; goals?: string; appearance?: string; speechStyle?: string; avatar?: string; referenceImages?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("dchr");
    return db.insert(dramaCharacter).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getCharacter(id: string) {
    const [item] = await db.select().from(dramaCharacter).where(eq(dramaCharacter.id, id)).limit(1);
    return item || null;
  }

  async updateCharacter(id: string, data: Record<string, unknown>) {
    return db.update(dramaCharacter).set(data).where(eq(dramaCharacter.id, id)).returning().then(r => r[0]);
  }

  async deleteCharacter(id: string) {
    await db.delete(dramaCharacter).where(eq(dramaCharacter.id, id));
  }

  async listLocations(userId: string, filters?: { projectId?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.projectId) conditions.push(eq(dramaLocation.projectId, filters.projectId));
    if (filters?.search) conditions.push(like(dramaLocation.name, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(dramaLocation).where(where).orderBy(desc(dramaLocation.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaLocation).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createLocation(data: { projectId: string; name: string; environment?: string; lighting?: string; weather?: string; referenceImages?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("dloc");
    return db.insert(dramaLocation).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getLocation(id: string) {
    const [item] = await db.select().from(dramaLocation).where(eq(dramaLocation.id, id)).limit(1);
    return item || null;
  }

  async updateLocation(id: string, data: Record<string, unknown>) {
    return db.update(dramaLocation).set(data).where(eq(dramaLocation.id, id)).returning().then(r => r[0]);
  }

  async deleteLocation(id: string) {
    await db.delete(dramaLocation).where(eq(dramaLocation.id, id));
  }

  async listEpisodes(userId: string, filters?: { projectId?: string; season?: number; status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.projectId) conditions.push(eq(dramaEpisode.projectId, filters.projectId));
    if (filters?.season) conditions.push(eq(dramaEpisode.season, filters.season));
    if (filters?.status) conditions.push(eq(dramaEpisode.status, filters.status));
    if (filters?.search) conditions.push(like(dramaEpisode.title, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(dramaEpisode).where(where).orderBy(desc(dramaEpisode.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaEpisode).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createEpisode(data: { projectId: string; season?: number; episodeNumber: number; title: string; synopsis?: string; status?: string; duration?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("depi");
    return db.insert(dramaEpisode).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getEpisode(id: string) {
    const [item] = await db.select().from(dramaEpisode).where(eq(dramaEpisode.id, id)).limit(1);
    return item || null;
  }

  async updateEpisode(id: string, data: Record<string, unknown>) {
    return db.update(dramaEpisode).set(data).where(eq(dramaEpisode.id, id)).returning().then(r => r[0]);
  }

  async deleteEpisode(id: string) {
    await db.delete(dramaEpisode).where(eq(dramaEpisode.id, id));
  }

  async listScenes(episodeId: string, filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const where = eq(dramaScene.episodeId, episodeId);
    const [data, total] = await Promise.all([
      db.select().from(dramaScene).where(where).orderBy(dramaScene.order).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaScene).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createScene(data: { episodeId: string; order?: number; title?: string; description?: string; dialogue?: Array<{ characterId: string; text: string; emotion?: string }>; narration?: string; locationId?: string; characters?: string[]; cameraDirection?: string; transition?: string; duration?: number; emotion?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("dscn");
    return db.insert(dramaScene).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getScene(id: string) {
    const [item] = await db.select().from(dramaScene).where(eq(dramaScene.id, id)).limit(1);
    return item || null;
  }

  async updateScene(id: string, data: Record<string, unknown>) {
    return db.update(dramaScene).set(data).where(eq(dramaScene.id, id)).returning().then(r => r[0]);
  }

  async deleteScene(id: string) {
    await db.delete(dramaScene).where(eq(dramaScene.id, id));
  }

  async listJobs(userId: string, filters?: { projectId?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(dramaGenerationJob.userId, userId)];
    if (filters?.projectId) conditions.push(eq(dramaGenerationJob.projectId, filters.projectId));
    if (filters?.type) conditions.push(eq(dramaGenerationJob.type, filters.type));
    if (filters?.status) conditions.push(eq(dramaGenerationJob.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(dramaGenerationJob).where(where).orderBy(desc(dramaGenerationJob.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(dramaGenerationJob).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createJob(data: { projectId: string; userId: string; type: string; input?: Record<string, unknown> }) {
    const id = generateId("djob");
    return db.insert(dramaGenerationJob).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getJob(id: string) {
    const [item] = await db.select().from(dramaGenerationJob).where(eq(dramaGenerationJob.id, id)).limit(1);
    return item || null;
  }

  async updateJob(id: string, data: Record<string, unknown>) {
    return db.update(dramaGenerationJob).set(data).where(eq(dramaGenerationJob.id, id)).returning().then(r => r[0]);
  }

  async listTemplates(filters?: { genre?: string; isSystem?: boolean; isActive?: boolean }) {
    const conditions = [];
    if (filters?.genre) conditions.push(eq(dramaTemplate.genre, filters.genre));
    if (filters?.isSystem !== undefined) conditions.push(eq(dramaTemplate.isSystem, filters.isSystem));
    if (filters?.isActive !== undefined) conditions.push(eq(dramaTemplate.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(dramaTemplate).where(where).orderBy(dramaTemplate.name);
  }

  async getStats(userId: string) {
    const conditions = [eq(dramaProject.userId, userId)];
    const [projects] = await db.select({ count: sql<number>`count(*)` }).from(dramaProject).where(and(...conditions));
    const [totalScenes] = await db.select({ count: sql<number>`count(*)` }).from(dramaScene).innerJoin(dramaEpisode, eq(dramaScene.episodeId, dramaEpisode.id)).innerJoin(dramaProject, eq(dramaEpisode.projectId, dramaProject.id)).where(and(...conditions));
    const [totalEpisodes] = await db.select({ count: sql<number>`count(*)` }).from(dramaEpisode).innerJoin(dramaProject, eq(dramaEpisode.projectId, dramaProject.id)).where(and(...conditions));
    const [totalCharacters] = await db.select({ count: sql<number>`count(*)` }).from(dramaCharacter).where(and(...conditions));
    const [totalJobs] = await db.select({ count: sql<number>`count(*)` }).from(dramaGenerationJob).where(and(...conditions));
    const [completedJobs] = await db.select({ count: sql<number>`count(*)` }).from(dramaGenerationJob).where(and(...conditions, eq(dramaGenerationJob.status, "completed")));
    const [totalCredits] = await db.select({ sum: sql<number>`coalesce(sum(${dramaGenerationJob.creditsUsed}), 0)` }).from(dramaGenerationJob).where(and(...conditions));
    return {
      totalProjects: Number(projects?.count ?? 0),
      totalEpisodes: Number(totalEpisodes?.count ?? 0),
      totalScenes: Number(totalScenes?.count ?? 0),
      totalCharacters: Number(totalCharacters?.count ?? 0),
      totalJobs: Number(totalJobs?.count ?? 0),
      completedJobs: Number(completedJobs?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.sum ?? 0),
    };
  }
}

export const dramaStudioService = new DramaStudioService();
