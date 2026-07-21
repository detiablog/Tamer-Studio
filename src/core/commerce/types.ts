export type CommerceId = string;
export type WorkspaceId = string;
export type UserId = string;
export type Currency = string;
export type Amount = number;

export type OrderStatus = "draft" | "pending" | "paid" | "failed" | "cancelled" | "refunded" | "expired";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded";
export type PaymentProvider = "midtrans" | "ipaymu" | "xendit" | "stripe" | "paypal";
export type RefundStatus = "pending" | "succeeded" | "failed" | "cancelled";
export type VoucherType = "percentage" | "fixed" | "free_credits";
export type CouponType = "percentage" | "fixed" | "free_credits";

export interface Order {
  id: CommerceId;
  workspaceId: WorkspaceId;
  userId: UserId;
  status: OrderStatus;
  currency: Currency;
  subtotal: Amount;
  tax: Amount;
  discount: Amount;
  total: Amount;
  items: OrderItem[];
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  type: "subscription" | "credit_package" | "topup" | "product";
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Amount;
  totalPrice: Amount;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSession {
  id: CommerceId;
  workspaceId: WorkspaceId;
  userId: UserId;
  orderId: CommerceId;
  status: "open" | "completed" | "expired" | "abandoned";
  paymentProvider?: PaymentProvider;
  paymentIntentId?: string;
  currency: Currency;
  amount: Amount;
  expiresAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  id: CommerceId;
  orderId: CommerceId;
  checkoutSessionId: CommerceId;
  workspaceId: WorkspaceId;
  userId: UserId;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerReference?: string;
  amount: Amount;
  currency: Currency;
  metadata?: Record<string, unknown>;
  lastAttemptAt?: string;
  succeededAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAttempt {
  id: CommerceId;
  paymentIntentId: CommerceId;
  provider: PaymentProvider;
  status: PaymentStatus;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  providerReference?: string;
  amount: Amount;
  currency: Currency;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Voucher {
  id: CommerceId;
  code: string;
  type: VoucherType;
  value: Amount;
  currency: Currency;
  minPurchase?: Amount;
  maxDiscount?: Amount;
  expiresAt: string;
  usageLimit: number;
  userLimit: number;
  workspaceLimit: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherUsage {
  id: CommerceId;
  voucherId: CommerceId;
  orderId: CommerceId;
  workspaceId: WorkspaceId;
  userId: UserId;
  discountAmount: Amount;
  currency: Currency;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Coupon {
  id: CommerceId;
  code: string;
  type: CouponType;
  value: Amount;
  currency: Currency;
  minPurchase?: Amount;
  maxDiscount?: Amount;
  expiresAt: string;
  usageLimit: number;
  isActive: boolean;
  applicableProducts?: string[];
  applicablePlans?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: CommerceId;
  couponId: CommerceId;
  orderId: CommerceId;
  workspaceId: WorkspaceId;
  userId: UserId;
  discountAmount: Amount;
  currency: Currency;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TaxRule {
  id: CommerceId;
  name: string;
  region: string;
  rate: number;
  type: "percentage" | "fixed";
  currency: Currency;
  minAmount?: Amount;
  maxAmount?: Amount;
  isActive: boolean;
  priority: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TaxCalculation {
  subtotal: Amount;
  taxAmount: Amount;
  total: Amount;
  currency: Currency;
  appliedRules: Array<{
    ruleId: string;
    name: string;
    amount: Amount;
  }>;
}

export interface Refund {
  id: CommerceId;
  orderId: CommerceId;
  paymentIntentId: CommerceId;
  workspaceId: WorkspaceId;
  userId: UserId;
  status: RefundStatus;
  amount: Amount;
  currency: Currency;
  reason: string;
  refundType: "wallet" | "credit" | "external";
  externalRefundId?: string;
  metadata?: Record<string, unknown>;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutItemInput {
  productId: string;
  productName: string;
  type: OrderItem["type"];
  quantity: number;
  unitPrice: Amount;
  metadata?: Record<string, unknown>;
}

export interface CheckoutInput {
  workspaceId: WorkspaceId;
  userId: UserId;
  items: CheckoutItemInput[];
  currency: Currency;
  voucherCode?: string;
  couponCode?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId: CommerceId;
  providerReference?: string;
  status: PaymentStatus;
  amount: Amount;
  currency: Currency;
  metadata?: Record<string, unknown>;
}

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: Amount;
  reason?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: Amount;
  reason?: string;
}
