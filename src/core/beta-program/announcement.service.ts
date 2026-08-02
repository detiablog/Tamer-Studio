import { db } from "@/lib/db";
import { betaAnnouncement } from "@/lib/db/schema/beta";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class AnnouncementService {
  async createAnnouncement(data: { title: string; content: string; type?: string; target?: string; expiresAt?: Date }) {
    const id = generateId("banc");
    return db.insert(betaAnnouncement).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listAnnouncements(filters?: { type?: string; isPublished?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.type) conditions.push(eq(betaAnnouncement.type, filters.type));
    if (filters?.isPublished !== undefined) conditions.push(eq(betaAnnouncement.isPublished, filters.isPublished));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaAnnouncement).where(where).orderBy(desc(betaAnnouncement.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaAnnouncement).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async publishAnnouncement(id: string) {
    return db.update(betaAnnouncement).set({ isPublished: true, publishedAt: new Date() }).where(eq(betaAnnouncement.id, id)).returning().then(r => r[0]);
  }

  async deleteAnnouncement(id: string) {
    await db.delete(betaAnnouncement).where(eq(betaAnnouncement.id, id));
  }

  async getActiveAnnouncements() {
    const now = new Date();
    return db.select().from(betaAnnouncement).where(and(eq(betaAnnouncement.isPublished, true), sql`(${betaAnnouncement.expiresAt} IS NULL OR ${betaAnnouncement.expiresAt} > ${now})`)).orderBy(desc(betaAnnouncement.createdAt));
  }
}

export const announcementService = new AnnouncementService();
