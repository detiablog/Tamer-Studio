import type { PaymentIntent, PaymentResult, PaymentProvider } from "../types";
import { DefaultTransactionRepository } from "../transactions/transaction.repository";
import type { PaymentGateway } from "./gateway.interface";
import { logger } from "@/core/logger";

export interface PaymentService {
  initiatePayment(orderId: string, provider: PaymentProvider, amount: number, currency: string): Promise<PaymentResult>;
  confirmPayment(paymentIntentId: string, providerReference: string): Promise<PaymentIntent>;
  failPayment(paymentIntentId: string, reason: string): Promise<PaymentIntent>;
  getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | undefined>;
  listPaymentIntents(workspaceId: string): Promise<PaymentIntent[]>;
}

export class DefaultPaymentService implements PaymentService {
  private repository = new DefaultTransactionRepository();

  async initiatePayment(orderId: string, provider: PaymentProvider, amount: number, currency: string): Promise<PaymentResult> {
    const intent = await this.repository.createPaymentIntent({
      orderId,
      checkoutSessionId: "",
      workspaceId: "",
      userId: "",
      status: "pending",
      provider,
      amount,
      currency,
    });

    const requestPayload = {
      amount,
      currency,
      orderId,
      intentId: intent.id,
    };

    try {
      const gateway = this.getGateway(provider);
      const result = await gateway.createPayment(intent);

      if (result.success) {
        await this.repository.updatePaymentStatus(intent.id, "processing", {
          providerReference: result.providerReference,
          lastAttemptAt: new Date().toISOString(),
        });
      }

      await this.repository.createPaymentAttempt({
        paymentIntentId: intent.id,
        provider,
        status: result.success ? "succeeded" : "failed",
        requestPayload,
        responsePayload: result.metadata ?? {},
        providerReference: result.providerReference,
        amount,
        currency,
        metadata: result.metadata,
      });

      return {
        ...result,
        paymentIntentId: intent.id,
      };
    } catch (error) {
      logger.warn("Payment initiation failed", { orderId, provider, error: String(error) });
      await this.repository.createPaymentAttempt({
        paymentIntentId: intent.id,
        provider,
        status: "failed",
        requestPayload,
        responsePayload: { error: String(error) },
        amount,
        currency,
        errorMessage: String(error),
      });
      await this.repository.updatePaymentStatus(intent.id, "failed", { failedAt: new Date().toISOString() });
      throw new Error(`Payment initiation failed: ${error}`, { cause: error });
    }
  }

  async confirmPayment(paymentIntentId: string, providerReference: string): Promise<PaymentIntent> {
    const intent = await this.repository.getPaymentIntent(paymentIntentId);
    if (!intent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    const gateway = this.getGateway(intent.provider);
    const verification = await gateway.verifyPayment(providerReference);

    if (!verification.success) {
      throw new Error(`Payment verification failed for ${providerReference}`);
    }

    return this.repository.updatePaymentStatus(paymentIntentId, "succeeded", {
      providerReference,
      succeededAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
    });
  }

  async failPayment(paymentIntentId: string, reason: string): Promise<PaymentIntent> {
    const intent = await this.repository.getPaymentIntent(paymentIntentId);
    if (!intent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    await this.repository.createPaymentAttempt({
      paymentIntentId,
      provider: intent.provider,
      status: "failed",
      requestPayload: {},
      responsePayload: { reason },
      amount: intent.amount,
      currency: intent.currency,
      errorMessage: reason,
    });

    return this.repository.updatePaymentStatus(paymentIntentId, "failed", {
      failedAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
    });
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | undefined> {
    return this.repository.getPaymentIntent(paymentIntentId);
  }

  async listPaymentIntents(workspaceId: string): Promise<PaymentIntent[]> {
    return this.repository.getPaymentIntentsByWorkspace(workspaceId);
  }

  private getGateway(provider: PaymentProvider): PaymentGateway {
    const gateways: Record<string, PaymentGateway> = {};
    const gateway = gateways[provider];
    if (!gateway) {
      throw new Error(`Payment provider ${provider} is not configured`);
    }
    return gateway;
  }
}
