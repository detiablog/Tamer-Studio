import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, varchar, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    transactionNumber: varchar("transaction_number", { length: 100 }).notNull().unique(),
    userId: text("user_id").notNull(),
    providerId: varchar("provider_id", { length: 50 }).notNull(),
    method: varchar("method", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    currency: varchar("currency", { length: 10 }).default("USD").notNull(),
    subtotal: text("subtotal").notNull(),
    discount: text("discount").default("0").notNull(),
    tax: text("tax").default("0").notNull(),
    serviceFee: text("service_fee").default("0").notNull(),
    finalAmount: text("final_amount").notNull(),
    pricingItemId: text("pricing_item_id"),
    campaignId: text("campaign_id"),
    couponId: text("coupon_id"),
    providerTransactionId: text("provider_transaction_id"),
    providerResponse: jsonb("provider_response").$type<Record<string, unknown>>().default({}).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    paidAt: timestamp("paid_at"),
    expiredAt: timestamp("expired_at"),
    refundedAt: timestamp("refunded_at"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payment_user_id_idx").on(table.userId),
    index("payment_status_idx").on(table.status),
    index("payment_transaction_number_idx").on(table.transactionNumber),
    index("payment_provider_id_idx").on(table.providerId),
    index("payment_created_at_idx").on(table.createdAt),
  ]
);

export const paymentItem = pgTable(
  "payment_item",
  {
    id: text("id").primaryKey(),
    paymentId: text("payment_id")
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    type: varchar("type", { length: 50 }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: text("unit_price").notNull(),
    totalPrice: text("total_price").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payment_item_payment_id_idx").on(table.paymentId),
  ]
);

export const paymentInvoice = pgTable(
  "payment_invoice",
  {
    id: text("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
    paymentId: text("payment_id").references(() => payment.id, { onDelete: "set null" }),
    userId: text("user_id").notNull(),
    status: varchar("status", { length: 50 }).default("draft").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerAddress: jsonb("customer_address").$type<Record<string, unknown>>(),
    items: jsonb("items").$type<Record<string, unknown>[]>().default([]).notNull(),
    subtotal: text("subtotal").notNull(),
    tax: text("tax").default("0").notNull(),
    discount: text("discount").default("0").notNull(),
    total: text("total").notNull(),
    currency: varchar("currency", { length: 10 }).default("USD").notNull(),
    notes: text("notes"),
    companyInfo: jsonb("company_info").$type<Record<string, unknown>>().default({}).notNull(),
    paidAt: timestamp("paid_at"),
    dueAt: timestamp("due_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("payment_invoice_user_id_idx").on(table.userId),
    index("payment_invoice_number_idx").on(table.invoiceNumber),
    index("payment_invoice_status_idx").on(table.status),
  ]
);

export const paymentRefund = pgTable(
  "payment_refund",
  {
    id: text("id").primaryKey(),
    paymentId: text("payment_id")
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id").references(() => paymentInvoice.id, { onDelete: "set null" }),
    userId: text("user_id").notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    amount: text("amount").notNull(),
    reason: text("reason").notNull(),
    notes: text("notes"),
    adminNotes: text("admin_notes"),
    processedBy: text("processed_by"),
    processedAt: timestamp("processed_at"),
    providerRefundId: text("provider_refund_id"),
    providerResponse: jsonb("provider_response").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("refund_payment_id_idx").on(table.paymentId),
    index("refund_user_id_idx").on(table.userId),
    index("refund_status_idx").on(table.status),
  ]
);

export const paymentWebhook = pgTable(
  "payment_webhook",
  {
    id: text("id").primaryKey(),
    provider: varchar("provider", { length: 50 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    signature: text("signature"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    processed: boolean("processed").default(false).notNull(),
    error: text("error"),
    paymentId: text("payment_id").references(() => payment.id, { onDelete: "set null" }),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => [
    index("payment_webhook_provider_idx").on(table.provider),
    index("payment_webhook_payment_id_idx").on(table.paymentId),
    index("payment_webhook_processed_idx").on(table.processed),
  ]
);

export const paymentLog = pgTable(
  "payment_log",
  {
    id: text("id").primaryKey(),
    paymentId: text("payment_id").references(() => payment.id, { onDelete: "set null" }),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    description: text("description"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payment_log_payment_id_idx").on(table.paymentId),
    index("payment_log_event_type_idx").on(table.eventType),
  ]
);

export const paymentRelations = relations(payment, ({ one, many }) => ({
  items: many(paymentItem),
  invoice: one(paymentInvoice, {
    fields: [payment.id],
    references: [paymentInvoice.paymentId],
  }),
  refunds: many(paymentRefund),
  webhooks: many(paymentWebhook),
  logs: many(paymentLog),
}));

export const paymentItemRelations = relations(paymentItem, ({ one }) => ({
  payment: one(payment, {
    fields: [paymentItem.paymentId],
    references: [payment.id],
  }),
}));

export const paymentInvoiceRelations = relations(paymentInvoice, ({ one }) => ({
  payment: one(payment, {
    fields: [paymentInvoice.paymentId],
    references: [payment.id],
  }),
}));

export const paymentRefundRelations = relations(paymentRefund, ({ one }) => ({
  payment: one(payment, {
    fields: [paymentRefund.paymentId],
    references: [payment.id],
  }),
  invoice: one(paymentInvoice, {
    fields: [paymentRefund.invoiceId],
    references: [paymentInvoice.id],
  }),
}));

export const paymentWebhookRelations = relations(paymentWebhook, ({ one }) => ({
  payment: one(payment, {
    fields: [paymentWebhook.paymentId],
    references: [payment.id],
  }),
}));

export const paymentLogRelations = relations(paymentLog, ({ one }) => ({
  payment: one(payment, {
    fields: [paymentLog.paymentId],
    references: [payment.id],
  }),
}));
