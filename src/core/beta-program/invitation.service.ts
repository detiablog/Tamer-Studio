import { db } from "@/lib/db";
import { betaInvitation } from "@/lib/db/schema/beta";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export class InvitationService {
  async createInvitation(data: { email: string; invitedBy?: string; maxUses?: number; expiresInDays?: number }) {
    const id = generateId("binv");
    const code = data.email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() + Math.floor(Math.random() * 1000);
    const expiresAt = data.expiresInDays ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000) : null;
    return db.insert(betaInvitation).values({ id, email: data.email, code, invitedBy: data.invitedBy, maxUses: data.maxUses || 1, expiresAt }).returning().then(r => r[0]);
  }

  async listInvitations(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.status) conditions.push(eq(betaInvitation.status, filters.status));
    if (filters?.search) conditions.push(like(betaInvitation.email, `%${filters.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(betaInvitation).where(where).orderBy(desc(betaInvitation.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(betaInvitation).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getInvitation(id: string) {
    const [item] = await db.select().from(betaInvitation).where(eq(betaInvitation.id, id)).limit(1);
    return item || null;
  }

  async getInvitationByCode(code: string) {
    const [item] = await db.select().from(betaInvitation).where(eq(betaInvitation.code, code)).limit(1);
    return item || null;
  }

  async acceptInvitation(code: string) {
    const invite = await this.getInvitationByCode(code);
    if (!invite) return null;
    if (invite.expiresAt && invite.expiresAt < new Date()) return null;
    if (invite.currentUses >= invite.maxUses) return null;
    await db.update(betaInvitation).set({ status: "accepted", acceptedAt: new Date(), currentUses: invite.currentUses + 1 }).where(eq(betaInvitation.id, invite.id));
    return invite;
  }

  async revokeInvitation(id: string) {
    return db.update(betaInvitation).set({ status: "revoked", updatedAt: new Date() }).where(eq(betaInvitation.id, id)).returning().then(r => r[0]);
  }

  async deleteInvitation(id: string) {
    await db.delete(betaInvitation).where(eq(betaInvitation.id, id));
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(betaInvitation);
    const [pending] = await db.select({ count: sql<number>`count(*)` }).from(betaInvitation).where(eq(betaInvitation.status, "pending"));
    const [accepted] = await db.select({ count: sql<number>`count(*)` }).from(betaInvitation).where(eq(betaInvitation.status, "accepted"));
    return { total: Number(total?.count ?? 0), pending: Number(pending?.count ?? 0), accepted: Number(accepted?.count ?? 0) };
  }
}

export const invitationService = new InvitationService();
