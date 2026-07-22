import { db } from "@/lib/db";
import { wallet, creditTransaction, creditReservation } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Wallet, CreditTransaction, CreditReservation } from "@/lib/ai/types/billing";
import { randomUUID } from "crypto";

export class WalletRepository {
  async getWallet(workspaceId: string): Promise<Wallet | undefined> {
    const rows = await db.select().from(wallet).where(eq(wallet.workspaceId, workspaceId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapWallet(rows[0]);
  }

  async createWallet(workspaceId: string): Promise<Wallet> {
    const id = `wallet_${randomUUID()}`;
    const now = new Date();
    await db.insert(wallet).values({
      id,
      workspaceId,
      availableCredits: "0",
      reservedCredits: "0",
      pendingCredits: "0",
      currency: "USD",
      createdAt: now,
      updatedAt: now,
    });
    return { id, workspaceId, availableCredits: 0, reservedCredits: 0, pendingCredits: 0, currency: "USD", createdAt: now.toISOString(), updatedAt: now.toISOString() };
  }

  async getOrCreateWallet(workspaceId: string): Promise<Wallet> {
    const existing = await this.getWallet(workspaceId);
    if (existing) return existing;
    return this.createWallet(workspaceId);
  }

  async updateWalletBalance(walletId: string, availableCredits: string, reservedCredits: string): Promise<void> {
    const now = new Date();
    await db.update(wallet).set({ availableCredits, reservedCredits, updatedAt: now }).where(eq(wallet.id, walletId));
  }

  async createTransaction(tx: Omit<CreditTransaction, "id" | "createdAt">): Promise<CreditTransaction> {
    const id = `tx_${randomUUID()}`;
    const createdAt = new Date();
    await db.insert(creditTransaction).values({
      id,
      walletId: tx.walletId,
      workspaceId: tx.workspaceId,
      type: tx.type,
      amount: String(tx.amount),
      balanceBefore: String(tx.balanceBefore),
      balanceAfter: String(tx.balanceAfter),
      description: tx.description,
      metadata: tx.metadata ?? {},
      createdAt,
    });
    return { ...tx, id, createdAt: createdAt.toISOString() };
  }

  async getTransactionHistory(workspaceId: string, limit = 100): Promise<CreditTransaction[]> {
    const rows = await db.select().from(creditTransaction).where(eq(creditTransaction.workspaceId, workspaceId)).orderBy(desc(creditTransaction.createdAt)).limit(limit);
    return rows.map(this.mapTransaction);
  }

  async createReservation(reservation: Omit<CreditReservation, "id" | "createdAt">): Promise<CreditReservation> {
    const id = `res_${randomUUID()}`;
    const createdAt = new Date();
    const releasedAt = reservation.releasedAt ? new Date(reservation.releasedAt) : null;
    await db.insert(creditReservation).values({
      id,
      walletId: reservation.walletId,
      workspaceId: reservation.workspaceId,
      executionId: reservation.executionId,
      amount: String(reservation.amount),
      status: reservation.status,
      convertedTransactionId: reservation.convertedTransactionId ?? null,
      createdAt,
      releasedAt,
    });
    return { ...reservation, id, createdAt: createdAt.toISOString() };
  }

  async getReservationByExecution(executionId: string): Promise<CreditReservation | undefined> {
    const rows = await db.select().from(creditReservation).where(eq(creditReservation.executionId, executionId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapReservation(rows[0]);
  }

  async updateReservationStatus(id: string, status: CreditReservation["status"], releasedAt?: string): Promise<void> {
    const now = releasedAt ? new Date(releasedAt) : new Date();
    await db.update(creditReservation).set({ status, releasedAt: now }).where(eq(creditReservation.id, id));
  }

  private mapWallet(row: typeof wallet.$inferSelect): Wallet {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      availableCredits: Number(row.availableCredits),
      reservedCredits: Number(row.reservedCredits),
      pendingCredits: Number(row.pendingCredits),
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapTransaction(row: typeof creditTransaction.$inferSelect): CreditTransaction {
    return {
      id: row.id,
      walletId: row.walletId,
      workspaceId: row.workspaceId,
      type: row.type as CreditTransaction["type"],
      amount: Number(row.amount),
      balanceBefore: Number(row.balanceBefore),
      balanceAfter: Number(row.balanceAfter),
      description: row.description,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private mapReservation(row: typeof creditReservation.$inferSelect): CreditReservation {
    return {
      id: row.id,
      walletId: row.walletId,
      workspaceId: row.workspaceId,
      executionId: row.executionId,
      amount: Number(row.amount),
      status: row.status as CreditReservation["status"],
      createdAt: row.createdAt.toISOString(),
      releasedAt: row.releasedAt?.toISOString(),
      convertedTransactionId: row.convertedTransactionId ?? undefined,
    };
  }
}
