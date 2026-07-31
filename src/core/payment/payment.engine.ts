import type { PaymentProvider, PaymentProviderConfig, CreatePaymentInput, PaymentProviderResult, WebhookPayload, WebhookResult, RefundInput, RefundResult } from "./providers/payment-provider.interface";
import { IpaymuProvider } from "./providers/ipaymu.provider";
import { ManualTransferProvider } from "./providers/manual-transfer.provider";
import { paymentRepository } from "./payment.repository";
import { logger } from "@/core/logger";
import { generateId } from "@/modules/email/email.encryption";

const PROVIDER_MAP: Record<string, PaymentProvider> = {
  ipaymu: new IpaymuProvider(),
  manual_transfer: new ManualTransferProvider(),
};

const DEFAULT_PROVIDER_CONFIGS: Record<string, PaymentProviderConfig> = {
  ipaymu: {
    apiKey: process.env.IPAYMU_API_KEY,
    secretKey: process.env.IPAYMU_SECRET_KEY,
    merchantId: process.env.IPAYMU_MERCHANT_ID,
    sandbox: process.env.IPAYMU_SANDBOX === "true",
  },
  manual_transfer: {
    bankName: process.env.TRANSFER_BANK_NAME,
    accountNumber: process.env.TRANSFER_ACCOUNT_NUMBER,
    accountHolder: process.env.TRANSFER_ACCOUNT_HOLDER,
    instructions: process.env.TRANSFER_INSTRUCTIONS,
  },
};

export interface CreateCheckoutInput {
  userId: string;
  providerCode: string;
  method: string;
  currency: string;
  items: Array<{
    name: string;
    description?: string;
    type: string;
    quantity: number;
    unitPrice: number;
    metadata?: Record<string, unknown>;
  }>;
  pricingItemId?: string;
  campaignId?: string;
  couponId?: string;
  discount?: number;
  tax?: number;
  serviceFee?: number;
  returnUrl?: string;
  callbackUrl?: string;
  customerName?: string;
  customerEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  createdBy?: string;
}

export class PaymentEngine {
  private getProvider(code: string): PaymentProvider {
    const provider = PROVIDER_MAP[code];
    if (!provider) {
      throw new Error(`Payment provider not found: ${code}`);
    }
    return provider;
  }

  private getProviderConfig(code: string, overrides?: PaymentProviderConfig): PaymentProviderConfig {
    const defaults = DEFAULT_PROVIDER_CONFIGS[code] || {};
    return { ...defaults, ...overrides };
  }

  async createCheckout(input: CreateCheckoutInput, providerConfig?: PaymentProviderConfig): Promise<PaymentProviderResult> {
    const provider = this.getProvider(input.providerCode);
    const config = this.getProviderConfig(input.providerCode, providerConfig);

    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const finalAmount = subtotal - (input.discount || 0) + (input.tax || 0) + (input.serviceFee || 0);

    const transactionNumber = this.generateTransactionNumber(input.providerCode);

    const existingPayment = await paymentRepository.findPaymentByNumber(transactionNumber);
    if (existingPayment) {
      throw new Error("Duplicate transaction detected");
    }

    const payment = await paymentRepository.createPayment({
      id: generateId("pay"),
      transactionNumber,
      userId: input.userId,
      providerId: input.providerCode,
      method: input.method,
      status: "pending",
      currency: input.currency,
      subtotal: String(subtotal),
      discount: String(input.discount || 0),
      tax: String(input.tax || 0),
      serviceFee: String(input.serviceFee || 0),
      finalAmount: String(finalAmount),
      pricingItemId: input.pricingItemId || null,
      campaignId: input.campaignId || null,
      couponId: input.couponId || null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      createdBy: input.createdBy || input.userId,
    });

    for (const item of input.items) {
      await paymentRepository.createPaymentItem({
        id: generateId("payitem"),
        paymentId: payment.id,
        name: item.name,
        description: item.description || null,
        type: item.type,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        totalPrice: String(item.unitPrice * item.quantity),
        metadata: item.metadata || {},
      });
    }

    await this.logEvent(payment.id, "checkout.created", "Payment checkout initiated", {
      providerCode: input.providerCode,
      method: input.method,
      amount: finalAmount,
    }, input.ipAddress, input.userAgent, input.createdBy);

    const createInput: CreatePaymentInput = {
      transactionNumber,
      amount: finalAmount,
      currency: input.currency,
      customerName: input.customerName || "Customer",
      customerEmail: input.customerEmail || "",
      description: input.items.map((i) => i.name).join(", "),
      method: input.method,
      metadata: { paymentId: payment.id },
      returnUrl: input.returnUrl,
      callbackUrl: input.callbackUrl,
    };

    const result = await provider.createPayment(createInput, config);

    if (result.success) {
      await paymentRepository.updatePaymentStatus(payment.id, "processing", {
        providerTransactionId: result.providerTransactionId || null,
        providerResponse: result.rawResponse || {},
      });

      await this.logEvent(payment.id, "checkout.processing", "Payment sent to provider", {
        providerTransactionId: result.providerTransactionId,
      }, input.ipAddress, input.userAgent, input.createdBy);
    } else {
      await paymentRepository.updatePaymentStatus(payment.id, "failed", {
        providerResponse: result.rawResponse || { error: result.error },
      });

      await this.logEvent(payment.id, "checkout.failed", result.error || "Payment creation failed", {
        error: result.error,
      }, input.ipAddress, input.userAgent, input.createdBy);
    }

    return result;
  }

  async handleWebhook(providerCode: string, payload: WebhookPayload, config?: PaymentProviderConfig): Promise<WebhookResult> {
    const provider = this.getProvider(providerCode);
    const providerConfig = this.getProviderConfig(providerCode, config);

    const webhookId = generateId("wh");
    await paymentRepository.createWebhook({
      id: webhookId,
      provider: providerCode,
      eventType: payload.eventType,
      signature: payload.signature || null,
      payload: payload.data as Record<string, unknown>,
      processed: false,
      attempts: 0,
      maxAttempts: 3,
    });

    const result = await provider.processWebhook(payload, providerConfig);

    if (!result.valid) {
      await paymentRepository.updateWebhookStatus(webhookId, false, result.error || "Invalid webhook");
      return result;
    }

    if (result.paymentId) {
      const payment = await paymentRepository.findPaymentById(result.paymentId);
      if (payment) {
        const statusMap: Record<string, string> = {
          paid: "paid",
          pending: "processing",
          failed: "failed",
          refunded: "refunded",
        };

        const newStatus = statusMap[result.status || "pending"] || payment.status;
        const updateData: Record<string, unknown> = {};

        if (newStatus === "paid") {
          updateData.paidAt = new Date();
        } else if (newStatus === "refunded") {
          updateData.refundedAt = new Date();
        }

        await paymentRepository.updatePaymentStatus(payment.id, newStatus, updateData);

        await this.logEvent(payment.id, `webhook.${result.status}`, `Webhook processed: ${result.status}`, {
          provider: providerCode,
          eventType: payload.eventType,
          providerTransactionId: result.providerTransactionId,
        });
      }
    }

    await paymentRepository.updateWebhookStatus(webhookId, true);
    return result;
  }

  async processRefund(input: RefundInput, providerCode: string, userId: string, paymentId: string, config?: PaymentProviderConfig): Promise<RefundResult> {
    const provider = this.getProvider(providerCode);
    const providerConfig = this.getProviderConfig(providerCode, config);

    const result = await provider.refund(input, providerConfig);

    if (result.success) {
      await paymentRepository.createRefund({
        id: generateId("ref"),
        paymentId,
        invoiceId: null,
        userId,
        status: "completed",
        amount: String(input.amount),
        reason: input.reason,
        providerRefundId: result.refundId || null,
        providerResponse: result.rawResponse || {},
      });

      await paymentRepository.updatePaymentStatus(paymentId, "refunded", {
        refundedAt: new Date(),
      });

      await this.logEvent(paymentId, "refund.completed", "Refund processed successfully", {
        refundId: result.refundId,
        amount: input.amount,
      });
    } else {
      await paymentRepository.createRefund({
        id: generateId("ref"),
        paymentId,
        invoiceId: null,
        userId,
        status: "failed",
        amount: String(input.amount),
        reason: input.reason,
        providerResponse: { error: result.error },
      });

      await this.logEvent(paymentId, "refund.failed", result.error || "Refund failed", {
        error: result.error,
      });
    }

    return result;
  }

  async verifyPayment(providerCode: string, providerTransactionId: string, config?: PaymentProviderConfig): Promise<{ status: string; amount?: number }> {
    const provider = this.getProvider(providerCode);
    const providerConfig = this.getProviderConfig(providerCode, config);
    return provider.verifyPayment(providerTransactionId, providerConfig);
  }

  async getPaymentStatus(providerCode: string, providerTransactionId: string, config?: PaymentProviderConfig): Promise<{ status: string; amount?: number }> {
    const provider = this.getProvider(providerCode);
    const providerConfig = this.getProviderConfig(providerCode, config);
    return provider.getPaymentStatus(providerTransactionId, providerConfig);
  }

  private generateTransactionNumber(providerCode: string): string {
    const prefix = providerCode.toUpperCase().slice(0, 4);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private async logEvent(
    paymentId: string,
    eventType: string,
    description: string,
    metadata: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
    createdBy?: string,
  ): Promise<void> {
    try {
      await paymentRepository.createPaymentLog({
        id: generateId("paylog"),
        paymentId,
        eventType,
        description,
        metadata,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        createdBy: createdBy || null,
      });
    } catch (error) {
      logger.error("Failed to log payment event", error as Error, { paymentId, eventType });
    }
  }
}

export const paymentEngine = new PaymentEngine();
