import { pgTable, serial, text, integer, timestamp, jsonb, bigint, uuid } from "drizzle-orm/pg-core";

export const productionMetrics = pgTable("production_metrics", {
  id: serial("id").primaryKey(),
  productionId: uuid("production_id").notNull(),
  workspaceId: uuid("workspace_id").notNull(),
  status: text("status").notNull(), // completed, failed, running, queued
  aiModel: text("ai_model"),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  costUsd: text("cost_usd").default("0"),
  executionTimeMs: integer("execution_time_ms").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const userActivityMetrics = pgTable("user_activity_metrics", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  workspaceId: uuid("workspace_id").notNull(),
  action: text("action").notNull(), // create_project, run_production, publish, etc.
  resourceId: uuid("resource_id"),
  resourceType: text("resource_type"), // project, production, media
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaceMetrics = pgTable("workspace_metrics", {
  id: serial("id").primaryKey(),
  workspaceId: uuid("workspace_id").notNull(),
  date: timestamp("date").notNull(),
  productionsRun: integer("productions_run").default(0),
  productionsSucceeded: integer("productions_succeeded").default(0),
  productionsFailed: integer("productions_failed").default(0),
  mediaGenerated: integer("media_generated").default(0),
  totalCostUsd: text("total_cost_usd").default("0"),
  totalTokensUsed: bigint("total_tokens_used").default(BigInt(0)),
  activeUsers: integer("active_users").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
