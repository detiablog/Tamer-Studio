import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique, real } from "drizzle-orm/pg-core";

export const aiModelRegistry = pgTable("ai_model_registry", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  modelId: varchar("model_id", { length: 200 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  capability: varchar("capability", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  costPer1kInput: real("cost_per_1k_input").default(0).notNull(),
  costPer1kOutput: real("cost_per_1k_output").default(0).notNull(),
  avgLatencyMs: integer("avg_latency_ms").default(0).notNull(),
  contextWindow: integer("context_window").default(0).notNull(),
  maxOutput: integer("max_output").default(0).notNull(),
  supportsStreaming: boolean("supports_streaming").default(false).notNull(),
  supportsVision: boolean("supports_vision").default(false).notNull(),
  supportsJson: boolean("supports_json").default(false).notNull(),
  supportsToolCalling: boolean("supports_tool_calling").default(false).notNull(),
  supportsImageInput: boolean("supports_image_input").default(false).notNull(),
  supportsVideo: boolean("supports_video").default(false).notNull(),
  supportsAudio: boolean("supports_audio").default(false).notNull(),
  supportsBatch: boolean("supports_batch").default(false).notNull(),
  supportsStructuredOutput: boolean("supports_structured_output").default(false).notNull(),
  qualityScore: integer("quality_score").default(50).notNull(),
  speedScore: integer("speed_score").default(50).notNull(),
  reliabilityScore: integer("reliability_score").default(50).notNull(),
  version: varchar("version", { length: 50 }),
  deprecationStatus: varchar("deprecation_status", { length: 50 }),
  replacementModel: varchar("replacement_model", { length: 200 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  unique("ai_model_registry_provider_model_unique").on(table.providerId, table.modelId),
  index("ai_model_registry_provider_idx").on(table.providerId),
  index("ai_model_registry_capability_idx").on(table.capability),
  index("ai_model_registry_status_idx").on(table.status),
]);

export const aiCapabilityRegistry = pgTable("ai_capability_registry", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const aiRoutingDecision = pgTable("ai_routing_decision", {
  id: text("id").primaryKey(),
  requestId: varchar("request_id", { length: 100 }).notNull(),
  userId: text("user_id"),
  capability: varchar("capability", { length: 100 }),
  selectedProvider: varchar("selected_provider", { length: 100 }).notNull(),
  selectedModel: varchar("selected_model", { length: 200 }).notNull(),
  fallbackProvider: varchar("fallback_provider", { length: 100 }),
  fallbackModel: varchar("fallback_model", { length: 200 }),
  reason: text("reason"),
  estimatedCost: real("estimated_cost").default(0).notNull(),
  actualCost: real("actual_cost").default(0).notNull(),
  estimatedLatencyMs: integer("estimated_latency_ms").default(0).notNull(),
  actualLatencyMs: integer("actual_latency_ms").default(0).notNull(),
  qualityScore: integer("quality_score").default(0).notNull(),
  wasFallback: boolean("was_fallback").default(false).notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  routingStrategy: varchar("routing_strategy", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_routing_decision_request_idx").on(table.requestId),
  index("ai_routing_decision_user_idx").on(table.userId),
  index("ai_routing_decision_provider_idx").on(table.selectedProvider),
  index("ai_routing_decision_created_idx").on(table.createdAt),
]);

export const aiRequestLog = pgTable("ai_request_log", {
  id: text("id").primaryKey(),
  requestId: varchar("request_id", { length: 100 }).notNull(),
  userId: text("user_id"),
  workspaceId: text("workspace_id"),
  provider: varchar("provider", { length: 100 }).notNull(),
  model: varchar("model", { length: 200 }).notNull(),
  capability: varchar("capability", { length: 100 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  totalTokens: integer("total_tokens").default(0).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  costUsd: real("cost_usd").default(0).notNull(),
  latencyMs: integer("latency_ms").default(0).notNull(),
  queueTimeMs: integer("queue_time_ms").default(0).notNull(),
  wasFallback: boolean("was_fallback").default(false).notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_request_log_request_idx").on(table.requestId),
  index("ai_request_log_user_idx").on(table.userId),
  index("ai_request_log_provider_idx").on(table.provider),
  index("ai_request_log_status_idx").on(table.status),
  index("ai_request_log_created_idx").on(table.createdAt),
]);

export const aiCircuitBreaker = pgTable("ai_circuit_breaker", {
  id: text("id").primaryKey(),
  providerId: varchar("provider_id", { length: 100 }).notNull().unique(),
  state: varchar("state", { length: 50 }).default("closed").notNull(),
  failureCount: integer("failure_count").default(0).notNull(),
  successCount: integer("success_count").default(0).notNull(),
  lastFailureAt: timestamp("last_failure_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastStateChangeAt: timestamp("last_state_change_at").defaultNow().notNull(),
  failureThreshold: integer("failure_threshold").default(5).notNull(),
  recoveryTimeoutMs: integer("recovery_timeout_ms").default(30000).notNull(),
  halfOpenMaxAttempts: integer("half_open_max_attempts").default(3).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_circuit_breaker_provider_idx").on(table.providerId),
  index("ai_circuit_breaker_state_idx").on(table.state),
]);

export const aiQueueItem = pgTable("ai_queue_item", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  requestId: varchar("request_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("waiting").notNull(),
  priority: varchar("priority", { length: 50 }).default("normal").notNull(),
  capability: varchar("capability", { length: 100 }),
  provider: varchar("provider", { length: 100 }),
  model: varchar("model", { length: 200 }),
  estimatedCredits: integer("estimated_credits").default(0).notNull(),
  position: integer("position").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_queue_item_user_idx").on(table.userId),
  index("ai_queue_item_status_idx").on(table.status),
  index("ai_queue_item_priority_idx").on(table.priority),
  index("ai_queue_item_scheduled_idx").on(table.scheduledAt),
]);

export const aiUserPreference = pgTable("ai_user_preference", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  mode: varchar("mode", { length: 50 }).default("balanced").notNull(),
  maxCostPerRequest: real("max_cost_per_request"),
  maxLatencyMs: integer("max_latency_ms"),
  preferredProviders: jsonb("preferred_providers").$type<string[]>().default([]).notNull(),
  preferredModels: jsonb("preferred_models").$type<string[]>().default([]).notNull(),
  excludedProviders: jsonb("excluded_providers").$type<string[]>().default([]).notNull(),
  excludedModels: jsonb("excluded_models").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_user_pref_user_idx").on(table.userId),
]);

export const aiRuntimeMetric = pgTable("ai_runtime_metric", {
  id: text("id").primaryKey(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  provider: varchar("provider", { length: 100 }),
  model: varchar("model", { length: 200 }),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_metric_name_idx").on(table.metricName),
  index("ai_metric_category_idx").on(table.category),
  index("ai_metric_provider_idx").on(table.provider),
  index("ai_metric_created_idx").on(table.createdAt),
]);

export const aiModelRegistryRelations = relations(aiModelRegistry, ({ one }) => ({}));
export const aiCapabilityRegistryRelations = relations(aiCapabilityRegistry, ({ one }) => ({}));
export const aiRoutingDecisionRelations = relations(aiRoutingDecision, ({ one }) => ({}));
export const aiRequestLogRelations = relations(aiRequestLog, ({ one }) => ({}));
export const aiCircuitBreakerRelations = relations(aiCircuitBreaker, ({ one }) => ({}));
export const aiQueueItemRelations = relations(aiQueueItem, ({ one }) => ({}));
export const aiUserPreferenceRelations = relations(aiUserPreference, ({ one }) => ({}));
export const aiRuntimeMetricRelations = relations(aiRuntimeMetric, ({ one }) => ({}));
