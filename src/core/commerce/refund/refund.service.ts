import type { Refund } from "../types";
import { DefaultRefundRepository } from "./refund.repository";
import { DefaultPaymentService } from "../payment/payment.service";
import { logger } from "@/core/logger";

export interface RefundService {
  createRefund(orderId: string, paymentIntentId: string, workspaceId: string, userId: string, amount: number, reason: string, refundType: Refund["refundType"]): Promise<Refund>;
  getRefund(refundId: string): Promise<Refund | undefined>;
  listRefunds(orderId: string): Promise<Refund[]>;
  processRefund(refundId: string): Promise<Refund>;
}

export class DefaultRefundService implements RefundService {
  private repository = new DefaultRefundRepository();
  private paymentService = new DefaultPaymentService();

  async createRefund(orderId: string, paymentIntentId: string, workspaceId: string, userId: string, amount: number, reason: string, refundType: Refund["refundType"]): Promise<Refund> {
    const refund = await this.repository.createRefund({
      orderId,
      paymentIntentId,
      workspaceId,
      userId,
      status: "pending",
      amount,
      currency: "USD",
      reason,
      refundType,
    });
    logger.audit("refund.created", { refundId: refund.id, orderId, amount, reason });
    return refund;
  }

  async getRefund(refundId: string): Promise<Refund | undefined> {
    return this.repository.getRefund(refundId);
  }

  async listRefunds(orderId: string): Promise<Refund[]> {
    return this.repository.getRefundsByOrderId(orderId);
  }

  async processRefund(refundId: string): Promise<Refund> {
    const refund = await this.repository.getRefund(refundId);
    if (!refund) {
      throw new Error(`Refund ${refundId} not found`);
    }

    if (refund.status !== "pending") {
      throw new Error(`Refund ${refundId} is already ${refund.status}`);
    }

    let success = true;
    let externalRefundId: string | undefined;

    if (refund.refundType === "external" && refund.paymentIntentId) {
      const intent = await this.paymentService.getPaymentIntent(refund.paymentIntentId);
      if (intent) {
        try {
          const gateway = (this.paymentService as unknown as { getGateway: (p: string) => { refundPayment: (id: string, amount: number, currency: string) => Promise<{ success: boolean; externalRefundId?: string }> } }).getGateway(intent.provider);
          const result = await gateway.refundPayment(intent.providerReference ?? "", refund.amount, refund.currency);
          success = result.success;
          externalRefundId = result.externalRefundId;
        } catch (error) {
          logger.warn("External refund failed", { refundId, error: String(error) });
          success = false;
        }
      }
    }

    const status = success ? "succeeded" : "failed";
    const updated = await this.repository.updateRefundStatus(refundId, status, { externalRefundId });

    logger.audit("refund.processed", { refundId, status, externalRefundId });

    return updated;
  }
}
