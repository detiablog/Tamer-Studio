import type { PaymentIntent, PaymentResult, PaymentProvider } from "../types";

export interface PaymentGateway {
  readonly name: PaymentProvider;
  createPayment(intent: PaymentIntent): Promise<PaymentResult>;
  verifyPayment(providerReference: string): Promise<{ success: boolean; status: string; metadata?: Record<string, unknown> }>;
  refundPayment(providerReference: string, amount: number, currency: string): Promise<{ success: boolean; externalRefundId?: string }>;
  cancelPayment(providerReference: string): Promise<{ success: boolean }>;
}
