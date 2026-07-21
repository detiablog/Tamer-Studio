import { pgTable, text, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const wallet = pgTable(
  "wallet",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    availableCredits: text("available_credits").notNull().default("0"),
    reservedCredits: text("reserved_credits").notNull().default("0"),
    pendingCredits: text("pending_credits").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("wallet_workspace_unique").on(table.workspaceId),
    index("wallet_workspace_idx").on(table.workspaceId),
  ]
);

export const creditTransaction = pgTable(
  "credit_transaction",
  {
    id: text("id").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => wallet.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id").notNull(),
    type: text("type").notNull(),
    amount: text("amount").notNull(),
    balanceBefore: text("balance_before").notNull(),
    balanceAfter: text("balance_after").notNull(),
    description: text("description").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("credit_transaction_wallet_idx").on(table.walletId),
    index("credit_transaction_workspace_idx").on(table.workspaceId),
    index("credit_transaction_type_idx").on(table.type),
    index("credit_transaction_created_at_idx").on(table.createdAt),
  ]
);

export const creditReservation = pgTable(
  "credit_reservation",
  {
    id: text("id").primaryKey(),
    walletId: text("wallet_id").notNull().references(() => wallet.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id").notNull(),
    executionId: text("execution_id").notNull(),
    amount: text("amount").notNull(),
    status: text("status").notNull().default("active"),
    convertedTransactionId: text("converted_transaction_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    releasedAt: timestamp("released_at"),
  },
  (table) => [
    unique("reservation_execution_unique").on(table.executionId),
    index("reservation_wallet_idx").on(table.walletId),
    index("reservation_workspace_idx").on(table.workspaceId),
    index("reservation_status_idx").on(table.status),
  ]
);

export const usageRecord = pgTable(
  "usage_record",
  {
    id: text("id").primaryKey(),
    executionId: text("execution_id").notNull(),
    workflowId: text("workflow_id"),
    requestId: text("request_id"),
    userId: text("user_id"),
    workspaceId: text("workspace_id").notNull(),
    providerId: text("provider_id").notNull(),
    modelId: text("model_id").notNull(),
    capabilityId: text("capability_id").notNull(),
    tokens: text("tokens"),
    images: text("images"),
    videoSeconds: text("video_seconds"),
    audioSeconds: text("audio_seconds"),
    storageBytes: text("storage_bytes"),
    executionTimeMs: text("execution_time_ms"),
    estimatedCost: text("estimated_cost").notNull(),
    actualCost: text("actual_cost"),
    currency: text("currency").notNull().default("USD"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("usage_execution_unique").on(table.executionId),
    index("usage_workspace_idx").on(table.workspaceId),
    index("usage_provider_idx").on(table.providerId),
    index("usage_created_at_idx").on(table.createdAt),
  ]
);

export const costRecord = pgTable(
  "cost_record",
  {
    id: text("id").primaryKey(),
    executionId: text("execution_id").notNull(),
    usageRecordId: text("usage_record_id").notNull(),
    providerId: text("provider_id").notNull(),
    capabilityId: text("capability_id").notNull(),
    inputUnits: text("input_units").notNull().default("0"),
    outputUnits: text("output_units").notNull().default("0"),
    inputCost: text("input_cost").notNull().default("0"),
    outputCost: text("output_cost").notNull().default("0"),
    totalCost: text("total_cost").notNull().default("0"),
    currency: text("currency").notNull().default("USD"),
    pricingUsed: jsonb("pricing_used").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cost_record_execution_idx").on(table.executionId),
    index("cost_record_usage_idx").on(table.usageRecordId),
    index("cost_record_provider_idx").on(table.providerId),
  ]
);

export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    planId: text("plan_id").notNull(),
    status: text("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: text("cancel_at_period_end").notNull().default("false"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("subscription_workspace_unique").on(table.workspaceId),
    index("subscription_workspace_idx").on(table.workspaceId),
    index("subscription_status_idx").on(table.status),
  ]
);

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    subscriptionId: text("subscription_id").references(() => subscription.id),
    status: text("status").notNull().default("draft"),
    currency: text("currency").notNull().default("USD"),
    subtotal: text("subtotal").notNull().default("0"),
    tax: text("tax").notNull().default("0"),
    total: text("total").notNull().default("0"),
    lineItems: jsonb("line_items").$type<Record<string, unknown>[]>().notNull().default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invoice_workspace_idx").on(table.workspaceId),
    index("invoice_status_idx").on(table.status),
    index("invoice_created_at_idx").on(table.createdAt),
  ]
);

export const walletRelations = relations(wallet, ({ many }) => ({
  transactions: many(creditTransaction),
  reservations: many(creditReservation),
}));

export const creditTransactionRelations = relations(creditTransaction, ({ one }) => ({
  wallet: one(wallet, {
    fields: [creditTransaction.walletId],
    references: [wallet.id],
  }),
}));

export const creditReservationRelations = relations(creditReservation, ({ one }) => ({
  wallet: one(wallet, {
    fields: [creditReservation.walletId],
    references: [wallet.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ many }) => ({
  invoices: many(invoice),
}));

export const invoiceRelations = relations(invoice, ({ one }) => ({
  subscription: one(subscription, {
    fields: [invoice.subscriptionId],
    references: [subscription.id],
  }),
}));
