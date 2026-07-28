export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type BillingFrequency = "monthly" | "yearly" | "one_time";
export type RenewalBehavior = "auto" | "manual" | "none";

export interface CommercePlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tier: number;
  features: string[];
  storageLimitMb: number;
  projectLimit: number;
  workspaceLimit: number;
  aiCapabilities: string[];
  permissions: string[];
  isActive: boolean;
  displayOrder: number;
  badge: string | null;
}

export interface CommerceBillingOption {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  frequency: BillingFrequency;
  renewalBehavior: RenewalBehavior;
  isActive: boolean;
  displayOrder: number;
}

export interface CommercePlanPricing {
  id: string;
  planId: string;
  billingOptionId: string;
  price: number;
  currency: string;
  creditsIncluded: number;
  isActive: boolean;
}

export interface CommerceOrder {
  id: string;
  workspaceId: string;
  userId: string;
  planId: string | null;
  billingOptionId: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  creditsGranted: number;
  items: OrderItem[];
  metadata: Record<string, unknown>;
  expiresAt: Date | null;
  paidAt: Date | null;
  cancelledAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  type: "plan" | "credits";
  name: string;
  planId?: string;
  billingOptionId?: string;
  credits?: number;
  price: number;
}

export interface PlanWithPricing extends CommercePlan {
  pricings: (CommercePlanPricing & { billingOption: CommerceBillingOption })[];
}
