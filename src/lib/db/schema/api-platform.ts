import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const apiKey = pgTable("api_key", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  keyHash: varchar("key_hash", { length: 200 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 10 }).notNull(),
  scopes: jsonb("scopes").$type<string[]>().default(["read:profile"]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  requestCount: integer("request_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("api_key_user_idx").on(table.userId),
  index("api_key_hash_idx").on(table.keyHash),
]);

export const apiRequestLog = pgTable("api_request_log", {
  id: text("id").primaryKey(),
  apiKeyId: text("api_key_id"),
  userId: text("user_id").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  statusCode: integer("status_code").notNull(),
  latencyMs: integer("latency_ms"),
  requestSize: integer("request_size"),
  responseSize: integer("response_size"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("api_request_log_key_idx").on(table.apiKeyId),
  index("api_request_log_user_idx").on(table.userId),
  index("api_request_log_endpoint_idx").on(table.endpoint),
  index("api_request_log_created_idx").on(table.createdAt),
]);

export const apiWebhook = pgTable("api_webhook", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  url: text("url").notNull(),
  events: jsonb("events").$type<string[]>().default([]).notNull(),
  secret: varchar("secret", { length: 200 }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("api_webhook_user_idx").on(table.userId),
]);

export const apiWebhookDelivery = pgTable("api_webhook_delivery", {
  id: text("id").primaryKey(),
  webhookId: text("webhook_id").notNull().references(() => apiWebhook.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 100 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  statusCode: integer("status_code"),
  response: text("response"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
}, (table) => [
  index("api_webhook_delivery_webhook_idx").on(table.webhookId),
  index("api_webhook_delivery_status_idx").on(table.status),
]);

export const apiKeyRelations = relations(apiKey, ({ many }) => ({
  logs: many(apiRequestLog),
}));

export const apiWebhookRelations = relations(apiWebhook, ({ many }) => ({
  deliveries: many(apiWebhookDelivery),
}));

export const apiWebhookDeliveryRelations = relations(apiWebhookDelivery, ({ one }) => ({
  webhook: one(apiWebhook, { fields: [apiWebhookDelivery.webhookId], references: [apiWebhook.id] }),
}));
