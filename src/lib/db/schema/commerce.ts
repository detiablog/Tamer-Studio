import { pgTable, text, timestamp, jsonb, index, unique, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    status: text("status").notNull().default("draft"),
    currency: text("currency").notNull().default("USD"),
    subtotal: text("subtotal").notNull().default("0"),
    tax: text("tax").notNull().default("0"),
    discount: text("discount").notNull().default("0"),
    total: text("total").notNull().default("0"),
    items: jsonb("items").$type<Record<string, unknown>[]>().notNull().default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    expiresAt: timestamp("expires_at"),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    refundedAt: timestamp("refunded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("order_workspace_idx").on(table.workspaceId),
    index("order_user_idx").on(table.userId),
    index("order_status_idx").on(table.status),
    index("order_created_at_idx").on(table.createdAt),
  ]
);

export const checkoutSession = pgTable(
  "checkout_session",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("open"),
    paymentProvider: text("payment_provider"),
    paymentIntentId: text("payment_intent_id"),
    currency: text("currency").notNull().default("USD"),
    amount: text("amount").notNull().default("0"),
    expiresAt: timestamp("expires_at").notNull(),
    completedAt: timestamp("completed_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("checkout_session_workspace_idx").on(table.workspaceId),
    index("checkout_session_order_idx").on(table.orderId),
    index("checkout_session_status_idx").on(table.status),
  ]
);

export const paymentIntent = pgTable(
  "payment_intent",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
    checkoutSessionId: text("checkout_session_id").notNull().references(() => checkoutSession.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    status: text("status").notNull().default("pending"),
    provider: text("provider").notNull(),
    providerReference: text("provider_reference"),
    amount: text("amount").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    lastAttemptAt: timestamp("last_attempt_at"),
    succeededAt: timestamp("succeeded_at"),
    failedAt: timestamp("failed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payment_intent_order_idx").on(table.orderId),
    index("payment_intent_workspace_idx").on(table.workspaceId),
    index("payment_intent_status_idx").on(table.status),
    index("payment_intent_provider_idx").on(table.provider),
  ]
);

export const paymentAttempt = pgTable(
  "payment_attempt",
  {
    id: text("id").primaryKey(),
    paymentIntentId: text("payment_intent_id").notNull().references(() => paymentIntent.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("pending"),
    requestPayload: jsonb("request_payload").$type<Record<string, unknown>>().notNull().default({}),
    responsePayload: jsonb("response_payload").$type<Record<string, unknown>>().notNull().default({}),
    providerReference: text("provider_reference"),
    amount: text("amount").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payment_attempt_intent_idx").on(table.paymentIntentId),
    index("payment_attempt_status_idx").on(table.status),
  ]
);

export const voucher = pgTable(
  "voucher",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    type: text("type").notNull(),
    value: text("value").notNull(),
    currency: text("currency").notNull().default("USD"),
    minPurchase: text("min_purchase"),
    maxDiscount: text("max_discount"),
    expiresAt: timestamp("expires_at").notNull(),
    usageLimit: text("usage_limit").notNull().default("0"),
    userLimit: text("user_limit").notNull().default("0"),
    workspaceLimit: text("workspace_limit").notNull().default("0"),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("voucher_code_unique").on(table.code),
    index("voucher_code_idx").on(table.code),
    index("voucher_active_idx").on(table.isActive),
  ]
);

export const voucherUsage = pgTable(
  "voucher_usage",
  {
    id: text("id").primaryKey(),
    voucherId: text("voucher_id").notNull().references(() => voucher.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull(),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    discountAmount: text("discount_amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("voucher_usage_voucher_idx").on(table.voucherId),
    index("voucher_usage_workspace_idx").on(table.workspaceId),
    unique("voucher_usage_order_unique").on(table.orderId, table.voucherId),
  ]
);

export const coupon = pgTable(
  "coupon",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    type: text("type").notNull(),
    value: text("value").notNull(),
    currency: text("currency").notNull().default("USD"),
    minPurchase: text("min_purchase"),
    maxDiscount: text("max_discount"),
    expiresAt: timestamp("expires_at").notNull(),
    usageLimit: text("usage_limit").notNull().default("0"),
    isActive: boolean("is_active").default(true).notNull(),
    applicableProducts: jsonb("applicable_products").$type<string[]>().notNull().default([]),
    applicablePlans: jsonb("applicable_plans").$type<string[]>().notNull().default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("coupon_code_unique").on(table.code),
    index("coupon_code_idx").on(table.code),
    index("coupon_active_idx").on(table.isActive),
  ]
);

export const couponUsage = pgTable(
  "coupon_usage",
  {
    id: text("id").primaryKey(),
    couponId: text("coupon_id").notNull().references(() => coupon.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull(),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    discountAmount: text("discount_amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("coupon_usage_coupon_idx").on(table.couponId),
    index("coupon_usage_workspace_idx").on(table.workspaceId),
    unique("coupon_usage_order_unique").on(table.orderId, table.couponId),
  ]
);

export const taxRule = pgTable(
  "tax_rule",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    region: text("region").notNull(),
    rate: text("rate").notNull(),
    type: text("type").notNull(),
    currency: text("currency").notNull().default("USD"),
    minAmount: text("min_amount"),
    maxAmount: text("max_amount"),
    isActive: boolean("is_active").default(true).notNull(),
    priority: text("priority").notNull().default("0"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tax_rule_region_idx").on(table.region),
    index("tax_rule_active_idx").on(table.isActive),
  ]
);

export const refund = pgTable(
  "refund",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
    paymentIntentId: text("payment_intent_id").notNull(),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    status: text("status").notNull().default("pending"),
    amount: text("amount").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    reason: text("reason").notNull(),
    refundType: text("refund_type").notNull(),
    externalRefundId: text("external_refund_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("refund_order_idx").on(table.orderId),
    index("refund_workspace_idx").on(table.workspaceId),
    index("refund_status_idx").on(table.status),
  ]
);

export const orderRelations = relations(order, ({ many }) => ({
  checkoutSessions: many(checkoutSession),
  paymentIntents: many(paymentIntent),
  refunds: many(refund),
}));

export const checkoutSessionRelations = relations(checkoutSession, ({ one }) => ({
  order: one(order, {
    fields: [checkoutSession.orderId],
    references: [order.id],
  }),
}));

export const paymentIntentRelations = relations(paymentIntent, ({ one, many }) => ({
  order: one(order, {
    fields: [paymentIntent.orderId],
    references: [order.id],
  }),
  checkoutSession: one(checkoutSession, {
    fields: [paymentIntent.checkoutSessionId],
    references: [checkoutSession.id],
  }),
  attempts: many(paymentAttempt),
}));

export const paymentAttemptRelations = relations(paymentAttempt, ({ one }) => ({
  paymentIntent: one(paymentIntent, {
    fields: [paymentAttempt.paymentIntentId],
    references: [paymentIntent.id],
  }),
}));

export const voucherRelations = relations(voucher, ({ many }) => ({
  usages: many(voucherUsage),
}));

export const voucherUsageRelations = relations(voucherUsage, ({ one }) => ({
  voucher: one(voucher, {
    fields: [voucherUsage.voucherId],
    references: [voucher.id],
  }),
}));

export const couponRelations = relations(coupon, ({ many }) => ({
  usages: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupon, {
    fields: [couponUsage.couponId],
    references: [coupon.id],
  }),
}));

export const refundRelations = relations(refund, ({ one }) => ({
  order: one(order, {
    fields: [refund.orderId],
    references: [order.id],
  }),
}));
