import {
  findAllPlansWithPricings,
  findPlanBySlug,
  createPlan as repoCreatePlan,
  updatePlan as repoUpdatePlan,
  deletePlan as repoDeletePlan,
  findPlanById,
  findAllBillingOptions,
  findBillingOptionBySlug,
  createBillingOption as repoCreateBillingOption,
  updateBillingOption as repoUpdateBillingOption,
  findAllPricings,
  findPricingByPlanId,
  createPricing as repoCreatePricing,
  updatePricing as repoUpdatePricing,
  findPlanWithPricings,
  createOrder as repoCreateOrder,
  findOrderById,
  findOrdersByWorkspace,
  findAllOrders as repoFindAllOrders,
  updateOrderStatus,
} from "./commerce.repository";
import { WalletService } from "../wallet/service";
import { DefaultSubscriptionRepository } from "../subscription/subscription";
import { DefaultInvoiceRepository } from "../invoice/invoice";
import { StripeGateway } from "../payment/stripe-gateway";
import { logger } from "../logger";
import { config } from "@/core/config";
import { db } from "@/lib/db";
import { wallet as walletTable, planPricing } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type {
  CommercePlan,
  CommerceBillingOption,
  CommercePlanPricing,
  CommerceOrder,
  PlanWithPricing,
} from "./commerce.types";
import type { Wallet, CreditTransaction } from "@/core/types/billing";

let walletServiceInstance: WalletService | null = null;
let subscriptionRepositoryInstance: DefaultSubscriptionRepository | null = null;
let invoiceRepositoryInstance: DefaultInvoiceRepository | null = null;
let gatewayInstance: StripeGateway | null = null;

function getWalletService(): WalletService {
  if (!walletServiceInstance) walletServiceInstance = new WalletService();
  return walletServiceInstance;
}

function getSubscriptionRepository(): DefaultSubscriptionRepository {
  if (!subscriptionRepositoryInstance) subscriptionRepositoryInstance = new DefaultSubscriptionRepository();
  return subscriptionRepositoryInstance;
}

function getInvoiceRepository(): DefaultInvoiceRepository {
  if (!invoiceRepositoryInstance) invoiceRepositoryInstance = new DefaultInvoiceRepository();
  return invoiceRepositoryInstance;
}

function getGateway(): StripeGateway {
  if (!gatewayInstance) gatewayInstance = new StripeGateway();
  return gatewayInstance;
}

let seeded = false;

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function getPlans(): Promise<PlanWithPricing[]> {
  return findAllPlansWithPricings();
}

export async function getPlanBySlug(slug: string): Promise<PlanWithPricing | null> {
  const plan = await findPlanBySlug(slug);
  if (!plan) return null;
  return findPlanWithPricings(plan.id);
}

export async function createPlan(input: Omit<CommercePlan, "id"> & { id?: string }): Promise<CommercePlan> {
  return repoCreatePlan(input);
}

export async function updatePlan(id: string, input: Partial<Omit<CommercePlan, "id" | "createdAt">>): Promise<CommercePlan | null> {
  return repoUpdatePlan(id, input);
}

export async function deletePlan(id: string): Promise<void> {
  await repoDeletePlan(id);
}

// ─── Billing Options ─────────────────────────────────────────────────────────

export async function getBillingOptions(): Promise<CommerceBillingOption[]> {
  return findAllBillingOptions();
}

export async function getBillingOptionBySlug(slug: string): Promise<CommerceBillingOption | null> {
  return findBillingOptionBySlug(slug);
}

export async function createBillingOption(input: Omit<CommerceBillingOption, "id"> & { id?: string }): Promise<CommerceBillingOption> {
  return repoCreateBillingOption(input);
}

export async function updateBillingOption(id: string, input: Partial<Omit<CommerceBillingOption, "id" | "createdAt">>): Promise<CommerceBillingOption | null> {
  return repoUpdateBillingOption(id, input);
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

export async function getPricingForPlan(planId: string): Promise<(CommercePlanPricing & { billingOption: CommerceBillingOption })[]> {
  const planWithPricing = await findPlanWithPricings(planId);
  return planWithPricing?.pricings ?? [];
}

export async function getFullPricing(): Promise<PlanWithPricing[]> {
  return findAllPlansWithPricings();
}

export async function getAllPricings(): Promise<CommercePlanPricing[]> {
  return findAllPricings();
}

export async function createPricing(input: Omit<CommercePlanPricing, "id"> & { id?: string }): Promise<CommercePlanPricing> {
  return repoCreatePricing(input);
}

export async function updatePricing(id: string, input: Partial<Omit<CommercePlanPricing, "id" | "createdAt">>): Promise<CommercePlanPricing | null> {
  return repoUpdatePricing(id, input);
}

export async function deletePricing(id: string): Promise<void> {
  await db.delete(planPricing).where(eq(planPricing.id, id));
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export async function createCheckout(input: {
  workspaceId: string;
  userId: string;
  planId: string;
  billingOptionId: string;
}): Promise<{ orderId: string; checkoutUrl: string; amount: number }> {
  const plan = await findPlanById(input.planId);
  if (!plan) {
    throw new Error(`Plan not found: ${input.planId}`);
  }

  const allBillingOptions = await findAllBillingOptions();
  const billingOption = allBillingOptions.find((b) => b.id === input.billingOptionId);
  if (!billingOption) {
    throw new Error(`Billing option not found: ${input.billingOptionId}`);
  }

  const pricingRows = await findPricingByPlanId(input.planId);
  const pricing = pricingRows.find((p) => p.billingOptionId === input.billingOptionId && p.isActive);
  if (!pricing) {
    throw new Error(`No active pricing found for plan "${plan.slug}" with billing option "${billingOption.slug}"`);
  }

  const amount = pricing.price;
  const order = await repoCreateOrder({
    workspaceId: input.workspaceId,
    userId: input.userId,
    planId: input.planId,
    billingOptionId: input.billingOptionId,
    status: "pending",
    subtotal: amount,
    tax: 0,
    discount: 0,
    total: amount,
    currency: pricing.currency,
    creditsGranted: pricing.creditsIncluded,
    items: [
      {
        type: "plan",
        name: plan.name,
        planId: input.planId,
        billingOptionId: input.billingOptionId,
        credits: pricing.creditsIncluded,
        price: amount,
      },
    ],
    metadata: {
      planSlug: plan.slug,
      billingSlug: billingOption.slug,
      billingFrequency: billingOption.frequency,
    },
    expiresAt: null,
    paidAt: null,
    cancelledAt: null,
    refundedAt: null,
  });

  const baseUrl = config.app.url;

  const session = await getGateway().createCheckout({
    amount,
    currency: pricing.currency,
    workspaceId: input.workspaceId,
    userId: input.userId,
    planId: input.planId,
    credits: pricing.creditsIncluded,
    successUrl: `${baseUrl}/billing?checkout=success`,
    cancelUrl: `${baseUrl}/billing?checkout=cancelled`,
  });

  await updateOrderStatus(order.id, "pending", {});

  logger.info("Checkout created", {
    orderId: order.id,
    planSlug: plan.slug,
    billingSlug: billingOption.slug,
    amount,
    workspaceId: input.workspaceId,
  });

  return {
    orderId: order.id,
    checkoutUrl: session.url,
    amount,
  };
}

// ─── Payment Webhook ─────────────────────────────────────────────────────────

export async function handlePaymentCompleted(orderId: string): Promise<void> {
  const order = await findOrderById(orderId);
  if (!order) {
    logger.error("handlePaymentCompleted: order not found", undefined, { orderId });
    return;
  }

  if (order.status === "paid") {
    logger.info("Order already paid, skipping", { orderId });
    return;
  }

  await updateOrderStatus(order.id, "paid", { paidAt: new Date() });

  const wallet = await getWalletService().getOrCreateWallet(order.workspaceId);

  if (order.creditsGranted > 0) {
    await getWalletService().credit(
      wallet.id,
      order.workspaceId,
      order.creditsGranted,
      "purchase",
      `Credits granted for order ${order.id}`,
      { orderId: order.id, planId: order.planId },
    );
  }

  if (order.planId) {
    const billingOption = order.billingOptionId
      ? (await findAllBillingOptions()).find((b) => b.id === order.billingOptionId)
      : null;

    const isRecurring = billingOption && billingOption.frequency !== "one_time";

    if (isRecurring) {
      const existingSubscription = await getSubscriptionRepository().getSubscription(order.workspaceId);
      if (existingSubscription) {
        await getSubscriptionRepository().updateSubscriptionStatus(order.workspaceId, "canceled");
      }
      await getSubscriptionRepository().createSubscription(order.workspaceId, order.planId);
    }

    const plan = await findPlanById(order.planId);
    const lineItems = [
      {
        description: `${plan?.name ?? "Plan"} - ${billingOption?.name ?? "Purchase"}`,
        amount: order.total,
      },
    ];

    const invoice = await getInvoiceRepository().createInvoice(order.workspaceId, lineItems);
    await getInvoiceRepository().updateInvoiceStatus(invoice.id, "paid");
  }

  logger.info("Payment completed processed", {
    orderId: order.id,
    workspaceId: order.workspaceId,
    amount: order.total,
    creditsGranted: order.creditsGranted,
  });
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export async function getCredits(workspaceId: string): Promise<Wallet> {
  return getWalletService().getOrCreateWallet(workspaceId);
}

export async function consumeCredits(
  workspaceId: string,
  amount: number,
  description: string,
): Promise<CreditTransaction> {
  const wallet = await getWalletService().getOrCreateWallet(workspaceId);
  return getWalletService().debit(wallet.id, workspaceId, amount, "usage_debit", description);
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(workspaceId: string): Promise<CommerceOrder[]> {
  return findOrdersByWorkspace(workspaceId);
}

export async function getOrder(orderId: string): Promise<CommerceOrder | null> {
  return findOrderById(orderId);
}

export async function getAllOrders(filters?: {
  status?: string;
  workspaceId?: string;
}): Promise<CommerceOrder[]> {
  return repoFindAllOrders(filters);
}

export async function getAllWallets(): Promise<Wallet[]> {
  const rows = await db.select().from(walletTable);
  return rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspaceId,
    availableCredits: Number(row.availableCredits),
    reservedCredits: Number(row.reservedCredits),
    pendingCredits: Number(row.pendingCredits),
    currency: row.currency,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

// ─── Dashboard Access ────────────────────────────────────────────────────────

export async function hasActiveAccess(workspaceId: string): Promise<boolean> {
  try {
    const wallet = await getWalletService().getWallet(workspaceId);
    if (wallet.availableCredits > 0) return true;
  } catch {
    // No wallet → continue
  }

  const orders = await findOrdersByWorkspace(workspaceId);
  return orders.some((o) => o.status === "paid");
}
