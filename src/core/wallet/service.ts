import type { Wallet, CreditTransaction, CreditAmount, WalletId, TransactionId } from "@/lib/ai/types/billing";
import { WalletRepository } from "./repository";

export class WalletService {
  private repository = new WalletRepository();

  async getWallet(workspaceId: string): Promise<Wallet> {
    const wallet = await this.repository.getWallet(workspaceId);
    if (!wallet) {
      throw new Error(`Wallet not found for workspace ${workspaceId}`);
    }
    return wallet;
  }

  async createWallet(workspaceId: string): Promise<Wallet> {
    return this.repository.createWallet(workspaceId);
  }

  async getOrCreateWallet(workspaceId: string): Promise<Wallet> {
    return this.repository.getOrCreateWallet(workspaceId);
  }

  async debit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: "usage_debit" | "reserve" | "release",
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    const wallet = await this.getWallet(workspaceId);
    if (wallet.id !== walletId) {
      throw new Error(`Wallet ${walletId} does not belong to workspace ${workspaceId}`);
    }

    const balanceBefore = wallet.availableCredits;
    if (type === "usage_debit" && balanceBefore < amount) {
      throw new Error(`Insufficient credits: need ${amount}, have ${balanceBefore}`);
    }

    const isReserve = type === "reserve";
    const availableCredits = isReserve ? balanceBefore - amount : balanceBefore;
    const reservedCredits = isReserve ? wallet.reservedCredits + amount : wallet.reservedCredits;

    await this.repository.updateWalletBalance(walletId, String(availableCredits), String(reservedCredits));

    const balanceAfter = availableCredits;
    return this.repository.createTransaction({
      walletId,
      workspaceId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      metadata,
    });
  }

  async credit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: "purchase" | "refund" | "adjustment" | "expiration",
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditTransaction> {
    const wallet = await this.getWallet(workspaceId);
    if (wallet.id !== walletId) {
      throw new Error(`Wallet ${walletId} does not belong to workspace ${workspaceId}`);
    }

    const balanceBefore = wallet.availableCredits;
    const balanceAfter = balanceBefore + amount;

    await this.repository.updateWalletBalance(walletId, String(balanceAfter), String(wallet.reservedCredits));

    return this.repository.createTransaction({
      walletId,
      workspaceId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      metadata,
    });
  }

  async refund(walletId: WalletId, workspaceId: string, transactionId: TransactionId, reason: string): Promise<CreditTransaction> {
    const history = await this.repository.getTransactionHistory(workspaceId);
    const original = history.find((tx) => tx.id === transactionId);
    if (!original) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const refundAmount = Math.abs(original.amount);
    return this.credit(walletId, workspaceId, refundAmount, "refund", `Refund: ${reason}`, {
      originalTransactionId: transactionId,
    });
  }

  async getTransactionHistory(workspaceId: string): Promise<CreditTransaction[]> {
    return this.repository.getTransactionHistory(workspaceId);
  }
}
