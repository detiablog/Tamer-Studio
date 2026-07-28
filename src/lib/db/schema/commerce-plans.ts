import { pgTable, text, timestamp, integer, numeric, boolean, jsonb, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Plans - exactly 3 tiers
export const plan = pgTable("plan", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  tier: integer("tier").notNull().default(1),
  features: jsonb("features").notNull().default("[]"),
  storageLimitMb: integer("storage_limit_mb").notNull().default(500),
  projectLimit: integer("project_limit").notNull().default(3),
  workspaceLimit: integer("workspace_limit").notNull().default(1),
  aiCapabilities: jsonb("ai_capabilities").notNull().default("[]"),
  permissions: jsonb("permissions").notNull().default("[]"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  badge: text("badge"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("plan_slug_unique").on(table.slug),
  index("plan_tier_idx").on(table.tier),
  index("plan_is_active_idx").on(table.isActive),
]);

// Billing Options - independent from plans
export const billingOption = pgTable("billing_option", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // monthly, yearly, one_time
  renewalBehavior: text("renewal_behavior").notNull().default("auto"), // auto, manual, none
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("billing_option_slug_unique").on(table.slug),
  index("billing_option_frequency_idx").on(table.frequency),
]);

// Plan Pricing - connects plan + billing_option + price
export const planPricing = pgTable("plan_pricing", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => plan.id, { onDelete: "cascade" }),
  billingOptionId: text("billing_option_id").notNull().references(() => billingOption.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  creditsIncluded: integer("credits_included").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("plan_pricing_plan_option_unique").on(table.planId, table.billingOptionId),
  index("plan_pricing_plan_id_idx").on(table.planId),
  index("plan_pricing_billing_option_id_idx").on(table.billingOptionId),
]);

// Orders - purchase source of truth
export const commerceOrder = pgTable("commerce_order", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  userId: text("user_id").notNull(),
  planId: text("plan_id"),
  billingOptionId: text("billing_option_id"),
  status: text("status").notNull().default("pending"), // pending, paid, failed, refunded, cancelled
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  creditsGranted: integer("credits_granted").notNull().default(0),
  items: jsonb("items").notNull().default("[]"),
  metadata: jsonb("metadata").default("{}"),
  expiresAt: timestamp("expires_at"),
  paidAt: timestamp("paid_at"),
  cancelledAt: timestamp("cancelled_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("commerce_order_workspace_id_idx").on(table.workspaceId),
  index("commerce_order_user_id_idx").on(table.userId),
  index("commerce_order_status_idx").on(table.status),
  index("commerce_order_plan_id_idx").on(table.planId),
]);

// Plan Relations
export const planRelations = relations(plan, ({ many }) => ({
  pricings: many(planPricing),
}));

export const billingOptionRelations = relations(billingOption, ({ many }) => ({
  pricings: many(planPricing),
}));

export const planPricingRelations = relations(planPricing, ({ one }) => ({
  plan: one(plan, { fields: [planPricing.planId], references: [plan.id] }),
  billingOption: one(billingOption, { fields: [planPricing.billingOptionId], references: [billingOption.id] }),
}));

export const commerceOrderRelations = relations(commerceOrder, ({ one }) => ({
  plan: one(plan, { fields: [commerceOrder.planId], references: [plan.id] }),
  billingOption: one(billingOption, { fields: [commerceOrder.billingOptionId], references: [billingOption.id] }),
}));
