import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const aiProviderHealth = pgTable("ai_provider_health", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  status: varchar("status", { length: 50 }).default("unknown").notNull(),
  latencyMs: integer("latency_ms"),
  successRate: text("success_rate").default("0").notNull(),
  failureRate: text("failure_rate").default("0").notNull(),
  totalRequests: integer("total_requests").default(0).notNull(),
  totalFailures: integer("total_failures").default(0).notNull(),
  lastCheckedAt: timestamp("last_checked_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastFailureAt: timestamp("last_failure_at"),
  lastError: text("last_error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_provider_health_provider_idx").on(table.providerId),
]);

export const aiPromptTemplate = pgTable("ai_prompt_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  prompt: text("prompt").notNull(),
  variables: jsonb("variables").$type<string[]>().default([]).notNull(),
  modelHint: varchar("model_hint", { length: 200 }),
  isPublic: boolean("is_public").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  useCount: integer("use_count").default(0).notNull(),
  userId: text("user_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_prompt_template_user_idx").on(table.userId),
  index("ai_prompt_template_category_idx").on(table.category),
]);

export const aiGenerationHistory = pgTable("ai_generation_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  jobId: text("job_id"),
  type: varchar("type", { length: 50 }).notNull(),
  model: varchar("model", { length: 200 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  prompt: text("prompt"),
  parameters: jsonb("parameters").$type<Record<string, unknown>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  executionTimeMs: integer("execution_time_ms"),
  outputTokens: integer("output_tokens"),
  inputTokens: integer("input_tokens"),
  assets: jsonb("assets").$type<string[]>().default([]).notNull(),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_gen_history_user_idx").on(table.userId),
  index("ai_gen_history_type_idx").on(table.type),
  index("ai_gen_history_status_idx").on(table.status),
  index("ai_gen_history_created_idx").on(table.createdAt),
]);
