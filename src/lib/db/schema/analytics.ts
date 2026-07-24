import { pgTable, serial, text, integer, timestamp, jsonb, index, bigint as drizzleBigInt } from "drizzle-orm/pg-core";

export const productionMetrics = pgTable("production_metrics", {
  id: serial("id").primaryKey(),
  productionId: text("production_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  status: text("status").notNull(),
  aiModel: text("ai_model"),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  costUsd: text("cost_usd").default("0"),
  executionTimeMs: integer("execution_time_ms").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
}, (table) => [
  index("production_metrics_workspace_idx").on(table.workspaceId),
  index("production_metrics_status_idx").on(table.status),
  index("production_metrics_created_at_idx").on(table.createdAt),
]);

export const userActivityMetrics = pgTable("user_activity_metrics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  action: text("action").notNull(),
  resourceId: text("resource_id"),
  resourceType: text("resource_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("user_activity_metrics_user_idx").on(table.userId),
  index("user_activity_metrics_workspace_idx").on(table.workspaceId),
  index("user_activity_metrics_action_idx").on(table.action),
]);

export const workspaceMetrics = pgTable("workspace_metrics", {
  id: serial("id").primaryKey(),
  workspaceId: text("workspace_id").notNull(),
  date: timestamp("date").notNull(),
  productionsRun: integer("productions_run").default(0),
  productionsSucceeded: integer("productions_succeeded").default(0),
  productionsFailed: integer("productions_failed").default(0),
  mediaGenerated: integer("media_generated").default(0),
  totalCostUsd: text("total_cost_usd").default("0"),
  totalTokensUsed: drizzleBigInt("total_tokens_used", { mode: "bigint" }),
  activeUsers: integer("active_users").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workspace_metrics_workspace_idx").on(table.workspaceId),
  index("workspace_metrics_date_idx").on(table.date),
]);
