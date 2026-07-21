import { db } from "@/lib/db";
import { checkoutSession as checkoutSessionTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { CheckoutSession } from "../types";

export interface CheckoutRepository {
  createSession(session: Omit<CheckoutSession, "id" | "createdAt" | "updatedAt">): Promise<CheckoutSession>;
  getSession(sessionId: string): Promise<CheckoutSession | undefined>;
  getSessionByOrderId(orderId: string): Promise<CheckoutSession | undefined>;
  updateSessionStatus(sessionId: string, status: CheckoutSession["status"], extra?: Partial<CheckoutSession>): Promise<CheckoutSession>;
  listSessions(workspaceId: string): Promise<CheckoutSession[]>;
}

export class DefaultCheckoutRepository implements CheckoutRepository {
  async createSession(session: Omit<CheckoutSession, "id" | "createdAt" | "updatedAt">): Promise<CheckoutSession> {
    const id = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(checkoutSessionTable).values({
      id,
      workspaceId: session.workspaceId,
      userId: session.userId,
      orderId: session.orderId,
      status: session.status,
      paymentProvider: session.paymentProvider,
      paymentIntentId: session.paymentIntentId,
      currency: session.currency,
      amount: String(session.amount),
      expiresAt: new Date(session.expiresAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : null,
      metadata: session.metadata ?? {},
    });
    return {
      ...session,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getSession(sessionId: string): Promise<CheckoutSession | undefined> {
    const rows = await db.select().from(checkoutSessionTable).where(eq(checkoutSessionTable.id, sessionId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async getSessionByOrderId(orderId: string): Promise<CheckoutSession | undefined> {
    const rows = await db.select().from(checkoutSessionTable).where(eq(checkoutSessionTable.orderId, orderId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async updateSessionStatus(sessionId: string, status: CheckoutSession["status"], extra?: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const now = new Date();
    const updateData: Record<string, unknown> = { status, updatedAt: now };
    if (extra) {
      if (extra.completedAt) updateData.completedAt = new Date(extra.completedAt);
      if (extra.paymentIntentId) updateData.paymentIntentId = extra.paymentIntentId;
      if (extra.metadata !== undefined) updateData.metadata = extra.metadata;
    }
    await db.update(checkoutSessionTable).set(updateData).where(eq(checkoutSessionTable.id, sessionId));
    const rows = await db.select().from(checkoutSessionTable).where(eq(checkoutSessionTable.id, sessionId)).limit(1);
    if (rows.length === 0) throw new Error(`Checkout session ${sessionId} not found after update`);
    return this.mapRow(rows[0]);
  }

  async listSessions(workspaceId: string): Promise<CheckoutSession[]> {
    const rows = await db.select().from(checkoutSessionTable).where(eq(checkoutSessionTable.workspaceId, workspaceId));
    return rows.map((row) => this.mapRow(row));
  }

  private mapRow(row: typeof checkoutSessionTable.$inferSelect): CheckoutSession {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      userId: row.userId,
      orderId: row.orderId,
      status: row.status as CheckoutSession["status"],
      paymentProvider: row.paymentProvider as CheckoutSession["paymentProvider"],
      paymentIntentId: row.paymentIntentId ?? undefined,
      currency: row.currency,
      amount: Number(row.amount),
      expiresAt: row.expiresAt.toISOString(),
      completedAt: row.completedAt?.toISOString(),
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
