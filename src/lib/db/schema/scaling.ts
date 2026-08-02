import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real } from "drizzle-orm/pg-core";

export const scaleMetric = pgTable("scale_metric", {
  id: text("id").primaryKey(),
  metricName: varchar("metric_name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  node: varchar("node", { length: 100 }),
  tags: jsonb("tags").$type<Record<string, string>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("scale_metric_name_idx").on(table.metricName),
  index("scale_metric_category_idx").on(table.category),
  index("scale_metric_node_idx").on(table.node),
  index("scale_metric_created_idx").on(table.createdAt),
]);

export const scaleCapacityForecast = pgTable("scale_capacity_forecast", {
  id: text("id").primaryKey(),
  forecastType: varchar("forecast_type", { length: 100 }).notNull(),
  currentValue: real("current_value").notNull(),
  projectedValue: real("projected_value").notNull(),
  projectedDate: timestamp("projected_date").notNull(),
  confidence: real("confidence").default(0.8),
  recommendation: text("recommendation"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("scale_forecast_type_idx").on(table.forecastType),
  index("scale_forecast_created_idx").on(table.createdAt),
]);

export const scaleWorkerMetric = pgTable("scale_worker_metric", {
  id: text("id").primaryKey(),
  workerId: varchar("worker_id", { length: 100 }).notNull(),
  workerType: varchar("worker_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("idle").notNull(),
  cpuUsage: real("cpu_usage").default(0),
  memoryUsageMb: real("memory_usage_mb").default(0),
  currentJob: varchar("current_job", { length: 200 }),
  jobsProcessed: integer("jobs_processed").default(0).notNull(),
  jobsFailed: integer("jobs_failed").default(0).notNull(),
  avgJobDurationMs: integer("avg_job_duration_ms").default(0),
  restartCount: integer("restart_count").default(0),
  uptimeMs: integer("uptime_ms").default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("scale_worker_id_idx").on(table.workerId),
  index("scale_worker_type_idx").on(table.workerType),
  index("scale_worker_status_idx").on(table.status),
]);

export const scaleQueueMetric = pgTable("scale_queue_metric", {
  id: text("id").primaryKey(),
  queueName: varchar("queue_name", { length: 100 }).notNull(),
  queueLength: integer("queue_length").default(0).notNull(),
  processingCount: integer("processing_count").default(0).notNull(),
  completedCount: integer("completed_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
  retryingCount: integer("retrying_count").default(0).notNull(),
  avgWaitTimeMs: integer("avg_wait_time_ms").default(0),
  avgProcessTimeMs: integer("avg_process_time_ms").default(0),
  oldestItemAgeMs: integer("oldest_item_age_ms").default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("scale_queue_name_idx").on(table.queueName),
  index("scale_queue_created_idx").on(table.createdAt),
]);

export const scalePerformanceReport = pgTable("scale_performance_report", {
  id: text("id").primaryKey(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  period: varchar("period", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("scale_report_type_idx").on(table.reportType),
  index("scale_report_generated_idx").on(table.generatedAt),
]);

export const scaleCostMetric = pgTable("scale_cost_metric", {
  id: text("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 100 }),
  amountUsd: real("amount_usd").default(0).notNull(),
  creditsUsed: integer("credits_used").default(0),
  resourceType: varchar("resource_type", { length: 100 }),
  quantity: real("quantity").default(0),
  unitCost: real("unit_cost").default(0),
  period: varchar("period", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("scale_cost_category_idx").on(table.category),
  index("scale_cost_created_idx").on(table.createdAt),
]);

export const scaleLoadTest = pgTable("scale_load_test", {
  id: text("id").primaryKey(),
  testName: varchar("test_name", { length: 200 }).notNull(),
  targetUsers: integer("target_users").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  results: jsonb("results").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("scale_loadtest_status_idx").on(table.status),
  index("scale_loadtest_created_idx").on(table.createdAt),
]);

export const scaleResourceLimit = pgTable("scale_resource_limit", {
  id: text("id").primaryKey(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceName: varchar("resource_name", { length: 200 }).notNull(),
  limitType: varchar("limit_type", { length: 50 }).notNull(),
  limitValue: real("limit_value").notNull(),
  currentValue: real("current_value").default(0),
  unit: varchar("unit", { length: 50 }),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("scale_reslimit_type_idx").on(table.resourceType),
]);

export const scaleSettings = pgTable("scale_settings", {
  id: text("id").primaryKey(),
  autoScalingEnabled: boolean("auto_scaling_enabled").default(false).notNull(),
  minWorkers: integer("min_workers").default(1).notNull(),
  maxWorkers: integer("max_workers").default(10).notNull(),
  scaleUpThreshold: real("scale_up_threshold").default(80).notNull(),
  scaleDownThreshold: real("scale_down_threshold").default(20).notNull(),
  healthCheckIntervalMs: integer("health_check_interval_ms").default(30000).notNull(),
  gracefulShutdownTimeoutMs: integer("graceful_shutdown_timeout_ms").default(30000).notNull(),
  enableCdn: boolean("enable_cdn").default(false).notNull(),
  cdnProvider: varchar("cdn_provider", { length: 100 }),
  cachingEnabled: boolean("caching_enabled").default(true).notNull(),
  defaultCacheTtlSeconds: integer("default_cache_ttl_seconds").default(3600).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const scaleMetricRelations = relations(scaleMetric, ({ one }) => ({}));
export const scaleCapacityForecastRelations = relations(scaleCapacityForecast, ({ one }) => ({}));
export const scaleWorkerMetricRelations = relations(scaleWorkerMetric, ({ one }) => ({}));
export const scaleQueueMetricRelations = relations(scaleQueueMetric, ({ one }) => ({}));
export const scalePerformanceReportRelations = relations(scalePerformanceReport, ({ one }) => ({}));
export const scaleCostMetricRelations = relations(scaleCostMetric, ({ one }) => ({}));
export const scaleLoadTestRelations = relations(scaleLoadTest, ({ one }) => ({}));
export const scaleResourceLimitRelations = relations(scaleResourceLimit, ({ one }) => ({}));
export const scaleSettingsRelations = relations(scaleSettings, ({ one }) => ({}));
