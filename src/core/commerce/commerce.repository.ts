import { db } from "@/lib/db";
import { plan, billingOption, planPricing, commerceOrder } from "@/lib/db/schema/commerce-plans";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type {
  CommercePlan,
  CommerceBillingOption,
  CommercePlanPricing,
  CommerceOrder,
  PlanWithPricing,
  OrderStatus,
} from "./commerce.types";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return 0;
}

function mapPlan(row: any): CommercePlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    tier: row.tier,
    features: (row.features as string[]) ?? [],
    storageLimitMb: row.storageLimitMb ?? row.storage_limit_mb ?? 500,
    projectLimit: row.projectLimit ?? row.project_limit ?? 3,
    workspaceLimit: row.workspaceLimit ?? row.workspace_limit ?? 1,
    aiCapabilities: (row.aiCapabilities ?? row.ai_capabilities) as string[] ?? [],
    permissions: (row.permissions as string[]) ?? [],
    isActive: row.isActive ?? row.is_active ?? true,
    displayOrder: row.displayOrder ?? row.display_order ?? 0,
    badge: row.badge,
  };
}

function mapBillingOption(row: any): CommerceBillingOption {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    frequency: row.frequency,
    renewalBehavior: row.renewalBehavior ?? row.renewal_behavior ?? "auto",
    isActive: row.isActive ?? row.is_active ?? true,
    displayOrder: row.displayOrder ?? row.display_order ?? 0,
  };
}

function mapPlanPricing(row: any): CommercePlanPricing {
  return {
    id: row.id,
    planId: row.planId ?? row.plan_id,
    billingOptionId: row.billingOptionId ?? row.billing_option_id,
    price: toNumber(row.price),
    currency: row.currency,
    creditsIncluded: row.creditsIncluded ?? row.credits_included ?? 0,
    isActive: row.isActive ?? row.is_active ?? true,
  };
}

function mapOrder(row: any): CommerceOrder {
  return {
    id: row.id,
    workspaceId: row.workspaceId ?? row.workspace_id,
    userId: row.userId ?? row.user_id,
    planId: row.planId ?? row.plan_id,
    billingOptionId: row.billingOptionId ?? row.billing_option_id,
    status: row.status,
    subtotal: toNumber(row.subtotal),
    tax: toNumber(row.tax),
    discount: toNumber(row.discount),
    total: toNumber(row.total),
    currency: row.currency,
    creditsGranted: row.creditsGranted ?? row.credits_granted ?? 0,
    items: (row.items as any[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    expiresAt: row.expiresAt ?? row.expires_at ?? null,
    paidAt: row.paidAt ?? row.paid_at ?? null,
    cancelledAt: row.cancelledAt ?? row.cancelled_at ?? null,
    refundedAt: row.refundedAt ?? row.refunded_at ?? null,
    createdAt: row.createdAt ?? row.created_at ?? new Date(),
    updatedAt: row.updatedAt ?? row.updated_at ?? new Date(),
  };
}

// ─── Plan CRUD ────────────────────────────────────────────────────────────────

export async function findAllPlans(): Promise<CommercePlan[]> {
  const rows = await db.select().from(plan).orderBy(asc(plan.displayOrder));
  return rows.map(mapPlan);
}

export async function findPlanById(id: string): Promise<CommercePlan | null> {
  const [row] = await db.select().from(plan).where(eq(plan.id, id)).limit(1);
  return row ? mapPlan(row) : null;
}

export async function findPlanBySlug(slug: string): Promise<CommercePlan | null> {
  const [row] = await db.select().from(plan).where(eq(plan.slug, slug)).limit(1);
  return row ? mapPlan(row) : null;
}

export async function createPlan(
  data: Omit<CommercePlan, "id"> & { id?: string }
): Promise<CommercePlan> {
  const id = data.id ?? randomUUID();
  const now = new Date();
  const [row] = await db
    .insert(plan)
    .values({
      id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      tier: data.tier,
      features: data.features ?? [],
      storageLimitMb: data.storageLimitMb ?? 500,
      projectLimit: data.projectLimit ?? 3,
      workspaceLimit: data.workspaceLimit ?? 1,
      aiCapabilities: data.aiCapabilities ?? [],
      permissions: data.permissions ?? [],
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
      badge: data.badge,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return mapPlan(row);
}

export async function updatePlan(
  id: string,
  data: Partial<Omit<CommercePlan, "id" | "createdAt">>
): Promise<CommercePlan | null> {
  const [row] = await db
    .update(plan)
    .set({
      ...data,
      features: data.features ?? undefined,
      aiCapabilities: data.aiCapabilities ?? undefined,
      permissions: data.permissions ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(plan.id, id))
    .returning();
  return row ? mapPlan(row) : null;
}

export async function deletePlan(id: string): Promise<boolean> {
  const [row] = await db.delete(plan).where(eq(plan.id, id)).returning();
  return !!row;
}

// ─── Billing Option CRUD ──────────────────────────────────────────────────────

export async function findAllBillingOptions(): Promise<CommerceBillingOption[]> {
  const rows = await db.select().from(billingOption).orderBy(asc(billingOption.displayOrder));
  return rows.map(mapBillingOption);
}

export async function findBillingOptionById(id: string): Promise<CommerceBillingOption | null> {
  const [row] = await db.select().from(billingOption).where(eq(billingOption.id, id)).limit(1);
  return row ? mapBillingOption(row) : null;
}

export async function findBillingOptionBySlug(slug: string): Promise<CommerceBillingOption | null> {
  const [row] = await db.select().from(billingOption).where(eq(billingOption.slug, slug)).limit(1);
  return row ? mapBillingOption(row) : null;
}

export async function createBillingOption(
  data: Omit<CommerceBillingOption, "id"> & { id?: string }
): Promise<CommerceBillingOption> {
  const id = data.id ?? randomUUID();
  const now = new Date();
  const [row] = await db
    .insert(billingOption)
    .values({
      id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      renewalBehavior: data.renewalBehavior ?? "auto",
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return mapBillingOption(row);
}

export async function updateBillingOption(
  id: string,
  data: Partial<Omit<CommerceBillingOption, "id" | "createdAt">>
): Promise<CommerceBillingOption | null> {
  const [row] = await db
    .update(billingOption)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(billingOption.id, id))
    .returning();
  return row ? mapBillingOption(row) : null;
}

// ─── Plan Pricing CRUD ───────────────────────────────────────────────────────

export async function findAllPricings(): Promise<CommercePlanPricing[]> {
  const rows = await db.select().from(planPricing);
  return rows.map(mapPlanPricing);
}

export async function findPricingByPlanId(planId: string): Promise<CommercePlanPricing[]> {
  const rows = await db
    .select()
    .from(planPricing)
    .where(eq(planPricing.planId, planId));
  return rows.map(mapPlanPricing);
}

export async function findPricingById(id: string): Promise<CommercePlanPricing | null> {
  const [row] = await db.select().from(planPricing).where(eq(planPricing.id, id)).limit(1);
  return row ? mapPlanPricing(row) : null;
}

export async function createPricing(
  data: Omit<CommercePlanPricing, "id"> & { id?: string }
): Promise<CommercePlanPricing> {
  const id = data.id ?? randomUUID();
  const now = new Date();
  const [row] = await db
    .insert(planPricing)
    .values({
      id,
      planId: data.planId,
      billingOptionId: data.billingOptionId,
      price: String(data.price),
      currency: data.currency ?? "USD",
      creditsIncluded: data.creditsIncluded ?? 0,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return mapPlanPricing(row);
}

export async function updatePricing(
  id: string,
  data: Partial<Omit<CommercePlanPricing, "id" | "createdAt">>
): Promise<CommercePlanPricing | null> {
  const [row] = await db
    .update(planPricing)
    .set({
      ...data,
      price: data.price !== undefined ? String(data.price) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(planPricing.id, id))
    .returning();
  return row ? mapPlanPricing(row) : null;
}

// ─── Plan + Pricing Joins ─────────────────────────────────────────────────────

export async function findPlanWithPricings(planId: string): Promise<PlanWithPricing | null> {
  const [planRow] = await db.select().from(plan).where(eq(plan.id, planId)).limit(1);
  if (!planRow) return null;

  const pricingRows = await db
    .select({
      pricing: planPricing,
      billingOption: billingOption,
    })
    .from(planPricing)
    .innerJoin(billingOption, eq(planPricing.billingOptionId, billingOption.id))
    .where(eq(planPricing.planId, planId));

  return {
    ...mapPlan(planRow),
    pricings: pricingRows.map((r) => ({
      ...mapPlanPricing(r.pricing),
      billingOption: mapBillingOption(r.billingOption),
    })),
  };
}

export async function findAllPlansWithPricings(): Promise<PlanWithPricing[]> {
  const planRows = await db
    .select()
    .from(plan)
    .where(eq(plan.isActive, true))
    .orderBy(asc(plan.displayOrder));

  const allPricingRows = await db
    .select({
      pricing: planPricing,
      billingOption: billingOption,
      planId: planPricing.planId,
    })
    .from(planPricing)
    .innerJoin(billingOption, eq(planPricing.billingOptionId, billingOption.id));

  return planRows.map((p) => ({
    ...mapPlan(p),
    pricings: allPricingRows
      .filter((r) => r.planId === p.id)
      .map((r) => ({
        ...mapPlanPricing(r.pricing),
        billingOption: mapBillingOption(r.billingOption),
      })),
  }));
}

// ─── Order CRUD ───────────────────────────────────────────────────────────────

export async function createOrder(
  data: Omit<CommerceOrder, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<CommerceOrder> {
  const id = data.id ?? randomUUID();
  const now = new Date();
  const [row] = await db
    .insert(commerceOrder)
    .values({
      id,
      workspaceId: data.workspaceId,
      userId: data.userId,
      planId: data.planId,
      billingOptionId: data.billingOptionId,
      status: data.status ?? "pending",
      subtotal: String(data.subtotal ?? 0),
      tax: String(data.tax ?? 0),
      discount: String(data.discount ?? 0),
      total: String(data.total ?? 0),
      currency: data.currency ?? "USD",
      creditsGranted: data.creditsGranted ?? 0,
      items: data.items ?? [],
      metadata: data.metadata ?? {},
      expiresAt: data.expiresAt,
      paidAt: data.paidAt,
      cancelledAt: data.cancelledAt,
      refundedAt: data.refundedAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return mapOrder(row);
}

export async function findOrderById(id: string): Promise<CommerceOrder | null> {
  const [row] = await db.select().from(commerceOrder).where(eq(commerceOrder.id, id)).limit(1);
  return row ? mapOrder(row) : null;
}

export async function findOrdersByWorkspace(workspaceId: string): Promise<CommerceOrder[]> {
  const rows = await db
    .select()
    .from(commerceOrder)
    .where(eq(commerceOrder.workspaceId, workspaceId))
    .orderBy(desc(commerceOrder.createdAt));
  return rows.map(mapOrder);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra?: { paidAt?: Date; refundedAt?: Date; cancelledAt?: Date }
): Promise<CommerceOrder | null> {
  const [row] = await db
    .update(commerceOrder)
    .set({
      status,
      paidAt: extra?.paidAt,
      refundedAt: extra?.refundedAt,
      cancelledAt: extra?.cancelledAt,
      updatedAt: new Date(),
    })
    .where(eq(commerceOrder.id, id))
    .returning();
  return row ? mapOrder(row) : null;
}

export async function countOrdersByWorkspace(workspaceId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(commerceOrder)
    .where(eq(commerceOrder.workspaceId, workspaceId));
  return toNumber(result?.count) ?? 0;
}

export async function findAllOrders(filters?: {
  status?: string;
  workspaceId?: string;
}): Promise<CommerceOrder[]> {
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(commerceOrder.status, filters.status));
  }
  if (filters?.workspaceId) {
    conditions.push(eq(commerceOrder.workspaceId, filters.workspaceId));
  }

  const query = conditions.length > 0
    ? db.select().from(commerceOrder).where(and(...conditions)).orderBy(desc(commerceOrder.createdAt))
    : db.select().from(commerceOrder).orderBy(desc(commerceOrder.createdAt));

  const rows = await query;
  return rows.map(mapOrder);
}
