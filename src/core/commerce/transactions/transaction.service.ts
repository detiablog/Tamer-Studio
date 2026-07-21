import type { PaymentIntent, PaymentAttempt } from "../types";
import { DefaultTransactionRepository } from "./transaction.repository";

export interface TransactionService {
  getTransaction(intentId: string): Promise<PaymentIntent | undefined>;
  listTransactions(workspaceId: string): Promise<PaymentIntent[]>;
  getAttempts(intentId: string): Promise<PaymentAttempt[]>;
}

export class DefaultTransactionService implements TransactionService {
  private repository = new DefaultTransactionRepository();

  async getTransaction(intentId: string): Promise<PaymentIntent | undefined> {
    return this.repository.getPaymentIntent(intentId);
  }

  async listTransactions(workspaceId: string): Promise<PaymentIntent[]> {
    return this.repository.getPaymentIntentsByWorkspace(workspaceId);
  }

  async getAttempts(intentId: string): Promise<PaymentAttempt[]> {
    return this.repository.getPaymentAttempts(intentId);
  }
}
