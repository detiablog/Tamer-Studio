import crypto from "crypto";
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

interface IpaymuConfig extends PaymentProviderConfig {
  apiKey: string;
  secretKey: string;
  merchantId: string;
  sandbox?: boolean;
}

function getBaseUrl(sandbox?: boolean): string {
  return sandbox ? "https://sandbox.ipaymu.com" : "https://my.ipaymu.com";
}

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function generateSignature(body: string, secretKey: string, method: string): string {
  const data = method + body + secretKey;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export class IpaymuProvider extends PaymentProvider {
  name = "iPaymu";
  code = "ipaymu";

  async createPayment(input: CreatePaymentInput, config: PaymentProviderConfig): Promise<PaymentProviderResult> {
    const { apiKey, secretKey, merchantId, sandbox } = config as IpaymuConfig;
    if (!apiKey || !secretKey) {
      return { success: false, error: "iPaymu API key and secret key are required" };
    }

    const baseUrl = getBaseUrl(sandbox);
    const quantity = (input.metadata?.quantity as number) || 1;

    const body = JSON.stringify({
      product: [input.description],
      qty: [quantity],
      price: [input.amount],
      signature: "",
    });

    const signature = generateSignature(body, secretKey, "invoice");

    const payload = {
      merchant: merchantId,
      product: [input.description],
      qty: [quantity],
      price: [input.amount],
      fee: 0,
      total: input.amount,
      return_url: input.returnUrl || "",
      cancel_url: input.returnUrl || "",
      notify_url: input.callbackUrl || "",
      reference_no: input.transactionNumber,
      buyer_name: input.customerName,
      buyer_email: input.customerEmail,
      buyer_phone: input.metadata?.phone as string || "",
      signature,
    };

    try {
      const response = await fetch(`${baseUrl}/api/payment/create`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.Status === 200) {
        return {
          success: true,
          providerTransactionId: result.Data?.ReferenceNo,
          paymentUrl: result.Data?.PaymentUrl,
          redirectUrl: result.Data?.PaymentUrl,
          rawResponse: result,
        };
      }

      return {
        success: false,
        error: result.Message || "Payment creation failed",
        rawResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect to iPaymu",
      };
    }
  }

  async verifyPayment(providerTransactionId: string, config: PaymentProviderConfig): Promise<{ status: string; amount?: number }> {
    const result = await this.getPaymentStatus(providerTransactionId, config);
    return result;
  }

  async processWebhook(payload: WebhookPayload, config: PaymentProviderConfig): Promise<WebhookResult> {
    const { secretKey } = config as IpaymuConfig;

    try {
      const data = payload.data;
      const signature = payload.signature;

      if (secretKey && signature) {
        const expectedSignature = generateSignature(
          JSON.stringify(data),
          secretKey,
          "webhook"
        );
        if (expectedSignature !== signature) {
          return { valid: false, error: "Invalid webhook signature" };
        }
      }

      const paymentStatus = data.Status as string;
      const referenceNo = data.ReferenceNo as string;
      const amount = Number(data.Amount) || undefined;

      let status = "pending";
      if (paymentStatus === "berhasil" || paymentStatus === "settlement") {
        status = "paid";
      } else if (paymentStatus === "gagal" || paymentStatus === "expired") {
        status = "failed";
      } else if (paymentStatus === "refund") {
        status = "refunded";
      }

      return {
        valid: true,
        status,
        providerTransactionId: referenceNo,
        amount,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Webhook processing failed",
      };
    }
  }

  async refund(input: RefundInput, config: PaymentProviderConfig): Promise<RefundResult> {
    const { apiKey, secretKey, sandbox } = config as IpaymuConfig;
    if (!apiKey || !secretKey) {
      return { success: false, error: "iPaymu API key and secret key are required" };
    }

    const baseUrl = getBaseUrl(sandbox);
    const body = JSON.stringify({
      reference_no: input.providerTransactionId,
      amount: input.amount,
      reason: input.reason,
    });

    const signature = generateSignature(body, secretKey, "refund");

    try {
      const response = await fetch(`${baseUrl}/api/payment/refund`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
          reference_no: input.providerTransactionId,
          amount: input.amount,
          reason: input.reason,
          signature,
        }),
      });

      const result = await response.json();

      if (result.Status === 200) {
        return {
          success: true,
          refundId: result.Data?.RefundNo,
          rawResponse: result,
        };
      }

      return {
        success: false,
        error: result.Message || "Refund failed",
        rawResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process refund via iPaymu",
      };
    }
  }

  async getPaymentStatus(providerTransactionId: string, config: PaymentProviderConfig): Promise<{ status: string; amount?: number }> {
    const { apiKey, secretKey, sandbox } = config as IpaymuConfig;
    if (!apiKey || !secretKey) {
      return { status: "unknown" };
    }

    const baseUrl = getBaseUrl(sandbox);
    const body = JSON.stringify({
      reference_no: providerTransactionId,
    });

    const signature = generateSignature(body, secretKey, "payment");

    try {
      const response = await fetch(`${baseUrl}/api/payment/status`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
          reference_no: providerTransactionId,
          signature,
        }),
      });

      const result = await response.json();

      if (result.Status === 200) {
        const paymentStatus = result.Data?.Status;
        let status = "pending";
        if (paymentStatus === "berhasil" || paymentStatus === "settlement") {
          status = "paid";
        } else if (paymentStatus === "gagal" || paymentStatus === "expired") {
          status = "failed";
        } else if (paymentStatus === "refund") {
          status = "refunded";
        }
        return { status, amount: result.Data?.Amount };
      }

      return { status: "unknown" };
    } catch {
      return { status: "unknown" };
    }
  }
}
