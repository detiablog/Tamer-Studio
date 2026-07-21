import { db } from "@/lib/db";
import { paymentIntent as paymentIntentTable, paymentAttempt as paymentAttemptTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { PaymentIntent, PaymentAttempt } from "../types";

export interface TransactionRepository {
  createPaymentIntent(intent: Omit<PaymentIntent, "id" | "createdAt" | "updatedAt">): Promise<PaymentIntent>;
  getPaymentIntent(intentId: string): Promise<PaymentIntent | undefined>;
  getPaymentIntentsByWorkspace(workspaceId: string): Promise<PaymentIntent[]>;
  updatePaymentStatus(intentId: string, status: PaymentIntent["status"], extra?: Partial<PaymentIntent>): Promise<PaymentIntent>;
  createPaymentAttempt(attempt: Omit<PaymentAttempt, "id" | "createdAt">): Promise<PaymentAttempt>;
  getPaymentAttempts(intentId: string): Promise<PaymentAttempt[]>;
  getTransactionHistory(workspaceId: string): Promise<PaymentIntent[]>;
}

export class DefaultTransactionRepository implements TransactionRepository {
  async createPaymentIntent(intent: Omit<PaymentIntent, "id" | "createdAt" | "updatedAt">): Promise<PaymentIntent> {
    const id = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(paymentIntentTable).values({
      id,
      orderId: intent.orderId,
      checkoutSessionId: intent.checkoutSessionId,
      workspaceId: intent.workspaceId,
      userId: intent.userId,
      status: intent.status,
      provider: intent.provider,
      providerReference: intent.providerReference,
      amount: String(intent.amount),
      currency: intent.currency,
      metadata: intent.metadata ?? {},
      lastAttemptAt: intent.lastAttemptAt ? new Date(intent.lastAttemptAt) : null,
      succeededAt: intent.succeededAt ? new Date(intent.succeededAt) : null,
      failedAt: intent.failedAt ? new Date(intent.failedAt) : null,
    });
    return {
      ...intent,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getPaymentIntent(intentId: string): Promise<PaymentIntent | undefined> {
    const rows = await db.select().from(paymentIntentTable).where(eq(paymentIntentTable.id, intentId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapIntentRow(rows[0]);
  }

  async getPaymentIntentsByWorkspace(workspaceId: string): Promise<PaymentIntent[]> {
    const rows = await db.select().from(paymentIntentTable).where(eq(paymentIntentTable.workspaceId, workspaceId)).orderBy(desc(paymentIntentTable.createdAt));
    return rows.map((row) => this.mapIntentRow(row));
  }

  async updatePaymentStatus(intentId: string, status: PaymentIntent["status"], extra?: Partial<PaymentIntent>): Promise<PaymentIntent> {
    const now = new Date();
    const updateData: Record<string, unknown> = { status, updatedAt: now };
    if (extra) {
      if (extra.providerReference) updateData.providerReference = extra.providerReference;
      if (extra.lastAttemptAt) updateData.lastAttemptAt = new Date(extra.lastAttemptAt);
      if (extra.succeededAt) updateData.succeededAt = new Date(extra.succeededAt);
      if (extra.failedAt) updateData.failedAt = new Date(extra.failedAt);
      if (extra.metadata !== undefined) updateData.metadata = extra.metadata;
    }
    await db.update(paymentIntentTable).set(updateData).where(eq(paymentIntentTable.id, intentId));
    const rows = await db.select().from(paymentIntentTable).where(eq(paymentIntentTable.id, intentId)).limit(1);
    if (rows.length === 0) throw new Error(`Payment intent ${intentId} not found after update`);
    return this.mapIntentRow(rows[0]);
  }

  async createPaymentAttempt(attempt: Omit<PaymentAttempt, "id" | "createdAt">): Promise<PaymentAttempt> {
    const id = `pa_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(paymentAttemptTable).values({
      id,
      paymentIntentId: attempt.paymentIntentId,
      provider: attempt.provider,
      status: attempt.status,
      requestPayload: attempt.requestPayload,
      responsePayload: attempt.responsePayload,
      providerReference: attempt.providerReference,
      amount: String(attempt.amount),
      currency: attempt.currency,
      errorCode: attempt.errorCode,
      errorMessage: attempt.errorMessage,
      metadata: attempt.metadata ?? {},
    });
    return {
      ...attempt,
      id,
      createdAt: now.toISOString(),
    };
  }

  async getPaymentAttempts(intentId: string): Promise<PaymentAttempt[]> {
    const rows = await db.select().from(paymentAttemptTable).where(eq(paymentAttemptTable.paymentIntentId, intentId)).orderBy(desc(paymentAttemptTable.createdAt));
    return rows.map((row) => ({
      id: row.id,
      paymentIntentId: row.paymentIntentId,
      provider: row.provider as PaymentAttempt["provider"],
      status: row.status as PaymentAttempt["status"],
      requestPayload: row.requestPayload,
      responsePayload: row.responsePayload,
      providerReference: row.providerReference ?? undefined,
      amount: Number(row.amount),
      currency: row.currency,
      errorCode: row.errorCode ?? undefined,
      errorMessage: row.errorMessage ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async getTransactionHistory(workspaceId: string): Promise<PaymentIntent[]> {
    return this.getPaymentIntentsByWorkspace(workspaceId);
  }

  private mapIntentRow(row: typeof paymentIntentTable.$inferSelect): PaymentIntent {
    return {
      id: row.id,
      orderId: row.orderId,
      checkoutSessionId: row.checkoutSessionId,
      workspaceId: row.workspaceId,
      userId: row.userId,
      status: row.status as PaymentIntent["status"],
      provider: row.provider as PaymentIntent["provider"],
      providerReference: row.providerReference ?? undefined,
      amount: Number(row.amount),
      currency: row.currency,
      metadata: row.metadata as Record<string, unknown> | undefined,
      lastAttemptAt: row.lastAttemptAt?.toISOString(),
      succeededAt: row.succeededAt?.toISOString(),
      failedAt: row.failedAt?.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
