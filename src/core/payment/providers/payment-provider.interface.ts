export interface PaymentProviderConfig {
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  webhookSecret?: string;
  sandbox?: boolean;
  [key: string]: unknown;
}

export interface CreatePaymentInput {
  transactionNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  description: string;
  method: string;
  metadata?: Record<string, unknown>;
  returnUrl?: string;
  callbackUrl?: string;
  expiry?: Date;
}

export interface PaymentProviderResult {
  success: boolean;
  providerTransactionId?: string;
  paymentUrl?: string;
  redirectUrl?: string;
  qrCode?: string;
  vaNumber?: string;
  expiresAt?: Date;
  rawResponse?: Record<string, unknown>;
  error?: string;
}

export interface WebhookPayload {
  provider: string;
  eventType: string;
  signature: string;
  data: Record<string, unknown>;
  rawBody: string;
}

export interface WebhookResult {
  valid: boolean;
  paymentId?: string;
  status?: string;
  providerTransactionId?: string;
  amount?: number;
  error?: string;
}

export interface RefundInput {
  providerTransactionId: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  rawResponse?: Record<string, unknown>;
  error?: string;
}

export abstract class PaymentProvider {
  abstract name: string;
  abstract code: string;

  abstract createPayment(input: CreatePaymentInput, config: PaymentProviderConfig): Promise<PaymentProviderResult>;
  abstract verifyPayment(providerTransactionId: string, config: PaymentProviderConfig): Promise<{ status: string; amount?: number }>;
  abstract processWebhook(payload: WebhookPayload, config: PaymentProviderConfig): Promise<WebhookResult>;
  abstract refund(input: RefundInput, config: PaymentProviderConfig): Promise<RefundResult>;
  abstract getPaymentStatus(providerTransactionId: string, config: PaymentProviderConfig): Promise<{ status: string; amount?: number }>;
}
