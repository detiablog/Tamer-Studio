import type { WalletManager } from "./wallet-manager";
import type { Wallet, CreditTransaction, WalletId, CreditAmount, TransactionId } from "../../types/billing";

export class InMemoryWalletManager implements WalletManager {
  private wallets: Map<WalletId, Wallet> = new Map();
  private transactions: Map<TransactionId, CreditTransaction> = new Map();
  private workspaceIndex: Map<string, WalletId[]> = new Map();

  async getWallet(workspaceId: string): Promise<Wallet> {
    const walletIds = this.workspaceIndex.get(workspaceId);
    if (!walletIds || walletIds.length === 0) {
      throw new Error(`Wallet not found for workspace ${workspaceId}`);
    }
    const wallet = this.wallets.get(walletIds[0]);
    if (!wallet) {
      throw new Error(`Wallet not found for workspace ${workspaceId}`);
    }
    return wallet;
  }

  async createWallet(workspaceId: string): Promise<Wallet> {
    const existingIds = this.workspaceIndex.get(workspaceId) ?? [];
    if (existingIds.length > 0) {
      return this.getWallet(workspaceId);
    }

    const id = `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const wallet: Wallet = {
      id,
      workspaceId,
      availableCredits: 0,
      reservedCredits: 0,
      pendingCredits: 0,
      currency: "USD",
      createdAt: now,
      updatedAt: now,
    };

    this.wallets.set(id, wallet);
    this.workspaceIndex.set(workspaceId, [id]);
    return wallet;
  }

  async debit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: "usage_debit" | "reserve" | "release",
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    const balanceBefore = wallet.availableCredits;
    if (balanceBefore < amount) {
      throw new Error(`Insufficient credits: need ${amount}, have ${balanceBefore}`);
    }

    wallet.availableCredits = balanceBefore - amount;
    if (type === "reserve") {
      wallet.reservedCredits += amount;
    }
    wallet.updatedAt = new Date().toISOString();

    return this.recordTransaction(wallet, workspaceId, type, amount, description, metadata, balanceBefore);
  }

  async credit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: "purchase" | "refund" | "adjustment" | "expiration",
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction> {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    const balanceBefore = wallet.availableCredits;
    wallet.availableCredits = balanceBefore + amount;
    wallet.updatedAt = new Date().toISOString();

    return this.recordTransaction(wallet, workspaceId, type, amount, description, metadata);
  }

  async refund(
    walletId: WalletId,
    workspaceId: string,
    transactionId: TransactionId,
    reason: string,
  ): Promise<CreditTransaction> {
    const original = this.transactions.get(transactionId);
    if (!original) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const refundAmount = Math.abs(original.amount);
    return this.credit(walletId, workspaceId, refundAmount, "refund", `Refund: ${reason}`, {
      originalTransactionId: transactionId,
    });
  }

  async getTransactionHistory(workspaceId: string): Promise<CreditTransaction[]> {
    const walletIds = this.workspaceIndex.get(workspaceId) ?? [];
    const results: CreditTransaction[] = [];
    for (const walletId of walletIds) {
      const wallet = this.wallets.get(walletId);
      if (!wallet) continue;
      const txs = Array.from(this.transactions.values()).filter(
        (tx) => tx.walletId === walletId,
      );
      results.push(...txs);
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private recordTransaction(
    wallet: Wallet,
    workspaceId: string,
    type: CreditTransaction["type"],
    amount: CreditAmount,
    description: string,
    metadata?: Record<string, unknown>,
    balanceBefore?: CreditAmount,
  ): CreditTransaction {
    const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const transaction: CreditTransaction = {
      id,
      walletId: wallet.id,
      workspaceId,
      type,
      amount,
      balanceBefore: balanceBefore ?? wallet.availableCredits,
      balanceAfter: wallet.availableCredits,
      description,
      metadata,
      createdAt,
    };

    this.transactions.set(id, transaction);
    return transaction;
  }
}
