import { db } from "@/lib/db";
import { refund as refundTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Refund } from "../types";

export interface RefundRepository {
  createRefund(refund: Omit<Refund, "id" | "createdAt" | "updatedAt">): Promise<Refund>;
  getRefund(refundId: string): Promise<Refund | undefined>;
  getRefundsByOrderId(orderId: string): Promise<Refund[]>;
  getRefundsByWorkspace(workspaceId: string): Promise<Refund[]>;
  updateRefundStatus(refundId: string, status: Refund["status"], extra?: Partial<Refund>): Promise<Refund>;
}

export class DefaultRefundRepository implements RefundRepository {
  async createRefund(refund: Omit<Refund, "id" | "createdAt" | "updatedAt">): Promise<Refund> {
    const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(refundTable).values({
      id,
      orderId: refund.orderId,
      paymentIntentId: refund.paymentIntentId,
      workspaceId: refund.workspaceId,
      userId: refund.userId,
      status: refund.status,
      amount: String(refund.amount),
      currency: refund.currency,
      reason: refund.reason,
      refundType: refund.refundType,
      externalRefundId: refund.externalRefundId,
      metadata: refund.metadata ?? {},
      processedAt: refund.processedAt ? new Date(refund.processedAt) : null,
    });
    return {
      ...refund,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getRefund(refundId: string): Promise<Refund | undefined> {
    const rows = await db.select().from(refundTable).where(eq(refundTable.id, refundId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async getRefundsByOrderId(orderId: string): Promise<Refund[]> {
    const rows = await db.select().from(refundTable).where(eq(refundTable.orderId, orderId));
    return rows.map((row) => this.mapRow(row));
  }

  async getRefundsByWorkspace(workspaceId: string): Promise<Refund[]> {
    const rows = await db.select().from(refundTable).where(eq(refundTable.workspaceId, workspaceId));
    return rows.map((row) => this.mapRow(row));
  }

  async updateRefundStatus(refundId: string, status: Refund["status"], extra?: Partial<Refund>): Promise<Refund> {
    const now = new Date();
    const updateData: Record<string, unknown> = { status, updatedAt: now };
    if (extra) {
      if (extra.externalRefundId) updateData.externalRefundId = extra.externalRefundId;
      if (extra.processedAt) updateData.processedAt = new Date(extra.processedAt);
      if (extra.metadata !== undefined) updateData.metadata = extra.metadata;
    }
    if (status === "succeeded") {
      updateData.processedAt = now;
    }
    await db.update(refundTable).set(updateData).where(eq(refundTable.id, refundId));
    const rows = await db.select().from(refundTable).where(eq(refundTable.id, refundId)).limit(1);
    if (rows.length === 0) throw new Error(`Refund ${refundId} not found after update`);
    return this.mapRow(rows[0]);
  }

  private mapRow(row: typeof refundTable.$inferSelect): Refund {
    return {
      id: row.id,
      orderId: row.orderId,
      paymentIntentId: row.paymentIntentId,
      workspaceId: row.workspaceId,
      userId: row.userId,
      status: row.status as Refund["status"],
      amount: Number(row.amount),
      currency: row.currency,
      reason: row.reason,
      refundType: row.refundType as Refund["refundType"],
      externalRefundId: row.externalRefundId ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      processedAt: row.processedAt?.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
