import { db } from "@/lib/db";
import { project, projectNote, projectTimeline, projectActivity, projectTemplate } from "@/lib/db/schema/project-studio";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class ProjectStudioService {
  async listProjects(userId: string, filters?: { status?: string; type?: string; search?: string; isArchived?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(project.userId, userId)];
    if (filters?.status) conditions.push(eq(project.status, filters.status));
    if (filters?.type) conditions.push(eq(project.type, filters.type));
    if (filters?.search) conditions.push(like(project.name, `%${filters.search}%`));
    if (filters?.isArchived !== undefined) conditions.push(eq(project.isArchived, filters.isArchived));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(project).where(where).orderBy(desc(project.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(project).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createProject(userId: string, data: { name: string; description?: string; type?: string; category?: string; thumbnail?: string; tags?: string[]; color?: string; priority?: string; language?: string; targetPlatforms?: string[]; settings?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
    const id = generateId("proj");
    return db.insert(project).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getProject(id: string) {
    const [item] = await db.select().from(project).where(eq(project.id, id)).limit(1);
    return item || null;
  }

  async updateProject(id: string, data: Record<string, unknown>) {
    return db.update(project).set(data).where(eq(project.id, id)).returning().then(r => r[0]);
  }

  async deleteProject(id: string) {
    await db.delete(project).where(eq(project.id, id));
  }

  async listNotes(projectId: string, filters?: { search?: string; isPinned?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(projectNote.projectId, projectId)];
    if (filters?.search) conditions.push(like(projectNote.title, `%${filters.search}%`));
    if (filters?.isPinned !== undefined) conditions.push(eq(projectNote.isPinned, filters.isPinned));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(projectNote).where(where).orderBy(desc(projectNote.isPinned), desc(projectNote.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(projectNote).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createNote(projectId: string, data: { title?: string; content: string; isPinned?: boolean; tags?: string[] }) {
    const id = generateId("pnote");
    return db.insert(projectNote).values({ ...data, id, projectId }).returning().then(r => r[0]);
  }

  async getNote(id: string) {
    const [item] = await db.select().from(projectNote).where(eq(projectNote.id, id)).limit(1);
    return item || null;
  }

  async updateNote(id: string, data: Record<string, unknown>) {
    return db.update(projectNote).set(data).where(eq(projectNote.id, id)).returning().then(r => r[0]);
  }

  async deleteNote(id: string) {
    await db.delete(projectNote).where(eq(projectNote.id, id));
  }

  async listTimeline(projectId: string, filters?: { type?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(projectTimeline.projectId, projectId)];
    if (filters?.type) conditions.push(eq(projectTimeline.type, filters.type));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(projectTimeline).where(where).orderBy(desc(projectTimeline.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(projectTimeline).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createTimeline(projectId: string, data: { type: string; title: string; description?: string; icon?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("ptl");
    return db.insert(projectTimeline).values({ ...data, id, projectId }).returning().then(r => r[0]);
  }

  async listActivity(projectId: string, filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;
    const where = eq(projectActivity.projectId, projectId);
    const [data, total] = await Promise.all([
      db.select().from(projectActivity).where(where).orderBy(desc(projectActivity.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(projectActivity).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createActivity(data: { projectId: string; userId: string; action: string; entityType?: string; entityId?: string; metadata?: Record<string, unknown> }) {
    const id = generateId("pact");
    return db.insert(projectActivity).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listTemplates(filters?: { type?: string; category?: string; isActive?: boolean }) {
    const conditions = [];
    if (filters?.type) conditions.push(eq(projectTemplate.type, filters.type));
    if (filters?.category) conditions.push(eq(projectTemplate.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(projectTemplate.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(projectTemplate).where(where).orderBy(projectTemplate.name);
  }

  async getFavorites(userId: string, filters?: { page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(project.userId, userId), eq(project.isFavorite, true)];
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(project).where(where).orderBy(desc(project.updatedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(project).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getStats(userId: string) {
    const conditions = [eq(project.userId, userId)];
    const [projects] = await db.select({ count: sql<number>`count(*)` }).from(project).where(and(...conditions));
    const [activeProjects] = await db.select({ count: sql<number>`count(*)` }).from(project).where(and(...conditions, eq(project.status, "active")));
    const [archivedProjects] = await db.select({ count: sql<number>`count(*)` }).from(project).where(and(...conditions, eq(project.isArchived, true)));
    const [favoriteProjects] = await db.select({ count: sql<number>`count(*)` }).from(project).where(and(...conditions, eq(project.isFavorite, true)));
    const [totalNotes] = await db.select({ count: sql<number>`count(*)` }).from(projectNote).innerJoin(project, eq(projectNote.projectId, project.id)).where(and(...conditions));
    const [totalCredits] = await db.select({ sum: sql<number>`coalesce(sum(${project.creditsUsed}), 0)` }).from(project).where(and(...conditions));
    const [totalStorage] = await db.select({ sum: sql<number>`coalesce(sum(${project.storageUsed}), 0)` }).from(project).where(and(...conditions));
    return {
      totalProjects: Number(projects?.count ?? 0),
      activeProjects: Number(activeProjects?.count ?? 0),
      archivedProjects: Number(archivedProjects?.count ?? 0),
      favoriteProjects: Number(favoriteProjects?.count ?? 0),
      totalNotes: Number(totalNotes?.count ?? 0),
      totalCreditsUsed: Number(totalCredits?.sum ?? 0),
      totalStorageUsed: Number(totalStorage?.sum ?? 0),
    };
  }
}

export const projectStudioService = new ProjectStudioService();
