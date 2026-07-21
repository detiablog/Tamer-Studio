import type { CheckoutSession, CheckoutInput } from "../types";
import { DefaultCheckoutRepository } from "./checkout.repository";
import { DefaultOrderService } from "../orders/order.service";
import { DefaultPaymentService } from "../payment/payment.service";
import { DefaultVoucherService } from "../voucher/voucher.service";
import { DefaultCouponService } from "../coupon/coupon.service";
import { DefaultTaxService } from "../tax/tax.service";

export interface CheckoutService {
  initiateCheckout(input: CheckoutInput): Promise<{ orderId: string; checkoutSessionId: string }>;
  completeCheckout(checkoutSessionId: string): Promise<CheckoutSession>;
  getCheckoutSession(sessionId: string): Promise<CheckoutSession | undefined>;
}

export class DefaultCheckoutService implements CheckoutService {
  private orderService = new DefaultOrderService();
  private paymentService = new DefaultPaymentService();
  private voucherService = new DefaultVoucherService();
  private couponService = new DefaultCouponService();
  private taxService = new DefaultTaxService();
  private repository = new DefaultCheckoutRepository();

  async initiateCheckout(input: CheckoutInput): Promise<{ orderId: string; checkoutSessionId: string }> {
    const order = await this.orderService.createOrder({
      workspaceId: input.workspaceId,
      userId: input.userId,
      currency: input.currency,
      items: input.items,
      metadata: input.metadata,
    });

    const subtotal = order.subtotal;
    let discount = 0;

    const voucherResult = await this.voucherService.validateVoucher(input.voucherCode ?? "", input.workspaceId, subtotal);
    if (voucherResult.valid && voucherResult.discountAmount) {
      discount += voucherResult.discountAmount;
    }

    const couponResult = await this.couponService.validateCoupon(input.couponCode ?? "", input.workspaceId, subtotal, input.items.map((i) => i.productId));
    if (couponResult.valid && couponResult.discountAmount) {
      discount += couponResult.discountAmount;
    }

    discount = Math.min(discount, subtotal);

    const taxCalculation = await this.taxService.calculateTax(subtotal - discount, input.currency, "");
    const total = taxCalculation.subtotal - discount + taxCalculation.taxAmount;

    await this.updateOrderTotals(order.id, subtotal, taxCalculation.taxAmount, discount, total);

    const session = await this.repository.createSession({
      workspaceId: input.workspaceId,
      userId: input.userId,
      orderId: order.id,
      status: "open",
      currency: input.currency,
      amount: total,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      metadata: input.metadata,
    });

    return { orderId: order.id, checkoutSessionId: session.id };
  }

  async completeCheckout(checkoutSessionId: string): Promise<CheckoutSession> {
    const session = await this.repository.getSession(checkoutSessionId);
    if (!session) {
      throw new Error(`Checkout session ${checkoutSessionId} not found`);
    }

    if (session.status === "completed") {
      return session;
    }

    if (session.status === "expired" || session.status === "abandoned") {
      throw new Error(`Checkout session ${checkoutSessionId} is ${session.status}`);
    }

    return this.repository.updateSessionStatus(checkoutSessionId, "completed", { completedAt: new Date().toISOString() });
  }

  async getCheckoutSession(sessionId: string): Promise<CheckoutSession | undefined> {
    return this.repository.getSession(sessionId);
  }

  private async updateOrderTotals(orderId: string, subtotal: number, tax: number, discount: number, total: number): Promise<void> {
    const { db } = await import("@/lib/db");
    const { eq } = await import("drizzle-orm");
    const { order: orderTable } = await import("@/lib/db/schema");

    await db.update(orderTable)
      .set({
        subtotal: String(subtotal),
        tax: String(tax),
        discount: String(discount),
        total: String(total),
        updatedAt: new Date(),
      })
      .where(eq(orderTable.id, orderId));
  }
}
