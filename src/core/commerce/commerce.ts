import type { Order, PaymentIntent, PaymentResult, PaymentProvider, VoucherValidationResult, CouponValidationResult, TaxCalculation, Refund, CheckoutInput } from "./types";
import { DefaultOrderService } from "./orders/order.service";
import { DefaultPaymentService } from "./payment/payment.service";
import { DefaultCheckoutService } from "./checkout/checkout.service";
import { DefaultTransactionService } from "./transactions/transaction.service";
import { DefaultVoucherService } from "./voucher/voucher.service";
import { DefaultCouponService } from "./coupon/coupon.service";
import { DefaultTaxService } from "./tax/tax.service";
import { DefaultRefundService } from "./refund/refund.service";

export interface CommerceEngine {
  checkout(input: CheckoutInput): Promise<Order>;
  getOrder(orderId: string): Promise<Order | undefined>;
  getOrderByCheckoutSession(checkoutSessionId: string): Promise<Order | undefined>;
  listOrders(workspaceId: string): Promise<Order[]>;
  cancelOrder(orderId: string, workspaceId: string): Promise<Order>;

  initiatePayment(orderId: string, provider: string): Promise<PaymentResult>;
  confirmPayment(paymentIntentId: string, providerReference: string): Promise<PaymentIntent>;
  failPayment(paymentIntentId: string, reason: string): Promise<PaymentIntent>;
  getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | undefined>;
  listPaymentIntents(workspaceId: string): Promise<PaymentIntent[]>;

  createVoucher(voucher: unknown): Promise<unknown>;
  getVoucher(code: string): Promise<unknown>;
  listVouchers(): Promise<unknown[]>;
  validateVoucher(code: string, workspaceId: string, orderTotal: number): Promise<VoucherValidationResult>;
  recordVoucherUsage(voucherId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<unknown>;

  createCoupon(coupon: unknown): Promise<unknown>;
  getCoupon(code: string): Promise<unknown>;
  listCoupons(): Promise<unknown[]>;
  validateCoupon(code: string, workspaceId: string, orderTotal: number, productIds?: string[]): Promise<CouponValidationResult>;
  recordCouponUsage(couponId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<unknown>;

  registerTaxRule(rule: unknown): Promise<unknown>;
  getTaxRules(region: string): Promise<unknown[]>;
  calculateTax(subtotal: number, currency: string, region: string): Promise<TaxCalculation>;

  createRefund(orderId: string, amount: number, reason: string, refundType: Refund["refundType"]): Promise<Refund>;
  getRefund(refundId: string): Promise<Refund | undefined>;
  listRefunds(orderId: string): Promise<Refund[]>;
}

export class DefaultCommerceEngine implements CommerceEngine {
  private orderService = new DefaultOrderService();
  private paymentService = new DefaultPaymentService();
  private checkoutService = new DefaultCheckoutService();
  private transactionService = new DefaultTransactionService();
  private voucherService = new DefaultVoucherService();
  private couponService = new DefaultCouponService();
  private taxService = new DefaultTaxService();
  private refundService = new DefaultRefundService();

  async checkout(input: CheckoutInput): Promise<Order> {
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

    await this.orderService.updateOrderTotals(order.id, subtotal, taxCalculation.taxAmount, discount, total);

    const _session = await this.checkoutService.initiateCheckout(input);
    const _completed = await this.checkoutService.completeCheckout(_session.checkoutSessionId);

    return {
      ...order,
      subtotal,
      tax: taxCalculation.taxAmount,
      discount,
      total,
      updatedAt: new Date().toISOString(),
    };
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    return this.orderService.getOrder(orderId);
  }

  async getOrderByCheckoutSession(checkoutSessionId: string): Promise<Order | undefined> {
    const session = await this.checkoutService.getCheckoutSession(checkoutSessionId);
    if (!session) return undefined;
    return this.orderService.getOrder(session.orderId);
  }

  async listOrders(workspaceId: string): Promise<Order[]> {
    return this.orderService.listOrders(workspaceId);
  }

  async cancelOrder(orderId: string, _workspaceId: string): Promise<Order> {
    return this.orderService.cancelOrder(orderId);
  }

  async initiatePayment(orderId: string, provider: string): Promise<PaymentResult> {
    const order = await this.orderService.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    return this.paymentService.initiatePayment(orderId, provider as PaymentProvider, order.total, order.currency);
  }

  async confirmPayment(paymentIntentId: string, providerReference: string): Promise<PaymentIntent> {
    return this.paymentService.confirmPayment(paymentIntentId, providerReference);
  }

  async failPayment(paymentIntentId: string, reason: string): Promise<PaymentIntent> {
    return this.paymentService.failPayment(paymentIntentId, reason);
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | undefined> {
    return this.paymentService.getPaymentIntent(paymentIntentId);
  }

  async listPaymentIntents(workspaceId: string): Promise<PaymentIntent[]> {
    return this.paymentService.listPaymentIntents(workspaceId);
  }

  async createVoucher(voucher: unknown): Promise<unknown> {
    return this.voucherService.createVoucher(voucher as never);
  }

  async getVoucher(code: string): Promise<unknown> {
    return this.voucherService.getVoucher(code);
  }

  async listVouchers(): Promise<unknown[]> {
    return this.voucherService.listVouchers();
  }

  async validateVoucher(code: string, workspaceId: string, orderTotal: number): Promise<VoucherValidationResult> {
    return this.voucherService.validateVoucher(code, workspaceId, orderTotal);
  }

  async recordVoucherUsage(voucherId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<unknown> {
    return this.voucherService.recordVoucherUsage(voucherId, orderId, workspaceId, userId, discountAmount);
  }

  async createCoupon(coupon: unknown): Promise<unknown> {
    return this.couponService.createCoupon(coupon as never);
  }

  async getCoupon(code: string): Promise<unknown> {
    return this.couponService.getCoupon(code);
  }

  async listCoupons(): Promise<unknown[]> {
    return this.couponService.listCoupons();
  }

  async validateCoupon(code: string, workspaceId: string, orderTotal: number, productIds?: string[]): Promise<CouponValidationResult> {
    return this.couponService.validateCoupon(code, workspaceId, orderTotal, productIds);
  }

  async recordCouponUsage(couponId: string, orderId: string, workspaceId: string, userId: string, discountAmount: number): Promise<unknown> {
    return this.couponService.recordCouponUsage(couponId, orderId, workspaceId, userId, discountAmount);
  }

  async registerTaxRule(rule: unknown): Promise<unknown> {
    return this.taxService.registerTaxRule(rule as never);
  }

  async getTaxRules(region: string): Promise<unknown[]> {
    return this.taxService.getTaxRules(region);
  }

  async calculateTax(subtotal: number, currency: string, region: string): Promise<TaxCalculation> {
    return this.taxService.calculateTax(subtotal, currency, region);
  }

  async createRefund(orderId: string, amount: number, reason: string, refundType: Refund["refundType"]): Promise<Refund> {
    const order = await this.orderService.getOrder(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const paymentIntents = await this.paymentService.listPaymentIntents(order.workspaceId);
    const paymentIntent = paymentIntents.find((pi) => pi.orderId === orderId);

    return this.refundService.createRefund(orderId, paymentIntent?.id ?? "", order.workspaceId, order.userId, amount, reason, refundType);
  }

  async getRefund(refundId: string): Promise<Refund | undefined> {
    return this.refundService.getRefund(refundId);
  }

  async listRefunds(orderId: string): Promise<Refund[]> {
    return this.refundService.listRefunds(orderId);
  }
}
