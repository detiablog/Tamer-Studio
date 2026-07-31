import {
  PaymentProvider,
  type PaymentProviderConfig,
  type CreatePaymentInput,
  type PaymentProviderResult,
  type WebhookPayload,
  type WebhookResult,
  type RefundInput,
  type RefundResult,
} from "./payment-provider.interface";

export interface ManualTransferConfig extends PaymentProviderConfig {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  instructions?: string;
}

export class ManualTransferProvider extends PaymentProvider {
  name = "Manual Transfer";
  code = "manual_transfer";

  async createPayment(input: CreatePaymentInput, config: PaymentProviderConfig): Promise<PaymentProviderResult> {
    const transferConfig = config as ManualTransferConfig;

    const instructions = {
      bankName: transferConfig.bankName || "Bank Transfer",
      accountNumber: transferConfig.accountNumber || "N/A",
      accountHolder: transferConfig.accountHolder || "N/A",
      amount: input.amount,
      currency: input.currency,
      reference: input.transactionNumber,
      description: input.description,
      additionalInstructions: transferConfig.instructions || null,
    };

    return {
      success: true,
      paymentUrl: undefined,
      rawResponse: {
        type: "manual_transfer",
        instructions,
        message: "Please complete the bank transfer manually using the provided instructions",
      },
    };
  }

  async verifyPayment(providerTransactionId: string, config: PaymentProviderConfig): Promise<{ status: string; amount?: number }> {
    return { status: "pending" };
  }

  async processWebhook(payload: WebhookPayload, config: PaymentProviderConfig): Promise<WebhookResult> {
    return {
      valid: false,
      error: "Manual transfer does not support webhook processing. Admin verification required.",
    };
  }

  async refund(input: RefundInput, config: PaymentProviderConfig): Promise<RefundResult> {
    return {
      success: false,
      error: "Manual transfer refunds must be processed manually by an administrator",
    };
  }

  async getPaymentStatus(providerTransactionId: string, config: PaymentProviderConfig): Promise<{ status: string; amount?: number }> {
    return { status: "pending" };
  }
}
