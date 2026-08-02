import { db } from "@/lib/db";
import { betaUser } from "@/lib/db/schema/beta";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class BetaUserService {
  async registerUser(userId: string, data: { invitationId?: string; role?: string; metadata?: Record<string, unknown> }) {
    const existing = await db.select().from(betaUser).where(eq(betaUser.userId, userId)).limit(1);
    if (existing.length > 0) return existing[0];
    const id = generateId("busr");
    return db.insert(betaUser).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async listUsers(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(betaUser.status, filters.status));
    if (filters?.search) conditions.push(like(betaUser.userId, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaUser).where(where).orderBy(desc(betaUser.joinedAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaUser).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getUser(userId: string) {
    const [item] = await db.select().from(betaUser).where(eq(betaUser.userId, userId)).limit(1);
    return item || null;
  }

  async updateUserStatus(userId: string, status: string) {
    return db.update(betaUser).set({ status, updatedAt: new Date() }).where(eq(betaUser.userId, userId)).returning().then(r => r[0]);
  }

  async recordActivity(userId: string) {
    return db.update(betaUser).set({ lastActiveAt: new Date() }).where(eq(betaUser.userId, userId)).returning().then(r => r[0]);
  }

  async deleteUser(userId: string) {
    await db.delete(betaUser).where(eq(betaUser.userId, userId));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(betaUser);
    const [active] = await db.select({ count: sql<number>`count(*)` }).from(betaUser).where(eq(betaUser.status, "active"));
    return { total: Number(total?.count ?? 0), active: Number(active?.count ?? 0) };
  }
}

export const betaUserService = new BetaUserService();
