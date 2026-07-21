import type {
  Wallet,
  CreditTransaction,
  TransactionId,
  WalletId,
  CreditAmount,
  CreditTransactionType,
} from "../../types/billing";

export interface WalletManager {
  getWallet(workspaceId: string): Promise<Wallet>;
  createWallet(workspaceId: string): Promise<Wallet>;
  debit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Exclude<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction>;
  credit(
    walletId: WalletId,
    workspaceId: string,
    amount: CreditAmount,
    type: Extract<CreditTransactionType, "purchase" | "refund" | "adjustment" | "expiration">,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditTransaction>;
  refund(
    walletId: WalletId,
    workspaceId: string,
    transactionId: TransactionId,
    reason: string,
  ): Promise<CreditTransaction>;
  getTransactionHistory(workspaceId: string): Promise<CreditTransaction[]>;
}
