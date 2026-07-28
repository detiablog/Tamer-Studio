export interface PaymentGateway {
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  verifyWebhook(payload: unknown, signature: string): Promise<WebhookEvent>;
  refund(input: RefundInput): Promise<RefundResult>;
}

export interface CheckoutInput {
  amount: number;
  currency: string;
  workspaceId: string;
  userId: string;
  planId?: string;
  credits?: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: "pending" | "completed" | "failed";
}

export interface WebhookEvent {
  type: "payment.completed" | "payment.failed" | "refund.completed";
  sessionId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface RefundInput {
  sessionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  id: string;
  status: "pending" | "completed" | "failed";
  amount: number;
}
