import type { Voucher, VoucherUsage, VoucherValidationResult } from "../types";
import { DefaultVoucherRepository } from "./voucher.repository";
import { logger } from "@/core/logger";

export interface VoucherService {
  createVoucher(voucher: Omit<Voucher, "id" | "createdAt" | "updatedAt">): Promise<Voucher>;
  getVoucher(code: string): Promise<Voucher | undefined>;
  listVouchers(): Promise<Voucher[]>;
  validateVoucher(code: string, workspaceId: string, orderTotal: number): Promise<VoucherValidationResult>;
  recordVoucherUsage(voucherId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<VoucherUsage>;
}

export class DefaultVoucherService implements VoucherService {
  private repository = new DefaultVoucherRepository();

  async createVoucher(voucher: Omit<Voucher, "id" | "createdAt" | "updatedAt">): Promise<Voucher> {
    return this.repository.createVoucher(voucher);
  }

  async getVoucher(code: string): Promise<Voucher | undefined> {
    return this.repository.getVoucher(code);
  }

  async listVouchers(): Promise<Voucher[]> {
    return this.repository.listVouchers();
  }

  async validateVoucher(code: string, workspaceId: string, orderTotal: number): Promise<VoucherValidationResult> {
    const voucher = await this.repository.getVoucher(code.toUpperCase());
    if (!voucher) {
      return { valid: false, reason: "Voucher not found" };
    }

    if (!voucher.isActive) {
      return { valid: false, reason: "Voucher is inactive" };
    }

    const now = new Date();
    const expiresAt = new Date(voucher.expiresAt);
    if (now > expiresAt) {
      return { valid: false, reason: "Voucher has expired" };
    }

    if (voucher.minPurchase && orderTotal < voucher.minPurchase) {
      return { valid: false, reason: `Minimum purchase of ${voucher.minPurchase} required` };
    }

    const globalUsages = await this.repository.getUsageCount(voucher.id);
    if (voucher.usageLimit > 0 && globalUsages >= voucher.usageLimit) {
      return { valid: false, reason: "Voucher usage limit reached" };
    }

    const workspaceUsages = await this.repository.getUsageCount(voucher.id, workspaceId);
    if (voucher.workspaceLimit > 0 && workspaceUsages >= voucher.workspaceLimit) {
      return { valid: false, reason: "Voucher workspace limit reached" };
    }

    let discountAmount = 0;
    if (voucher.type === "percentage") {
      discountAmount = (orderTotal * voucher.value) / 100;
    } else if (voucher.type === "fixed") {
      discountAmount = Math.min(voucher.value, orderTotal);
    } else if (voucher.type === "free_credits") {
      discountAmount = voucher.value;
    }

    if (voucher.maxDiscount) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return { valid: true, voucher, discountAmount };
  }

  async recordVoucherUsage(voucherId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<VoucherUsage> {
    const usage = await this.repository.recordUsage({
      voucherId,
      orderId,
      workspaceId,
      userId,
      discountAmount,
      currency: "USD",
    });
    logger.audit("voucher.used", { voucherId, orderId, workspaceId, userId, discountAmount });
    return usage;
  }
}
