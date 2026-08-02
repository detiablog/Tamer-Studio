import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real } from "drizzle-orm/pg-core";

export const obsMetric = pgTable("obs_metric", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  tags: jsonb("tags").$type<Record<string, string>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("obs_metric_name_idx").on(table.name),
  index("obs_metric_category_idx").on(table.category),
  index("obs_metric_created_idx").on(table.createdAt),
]);

export const obsLog = pgTable("obs_log", {
  id: text("id").primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }),
  requestId: varchar("request_id", { length: 100 }),
  severity: varchar("severity", { length: 20 }).default("info").notNull(),
  service: varchar("service", { length: 100 }),
  module: varchar("module", { length: 100 }),
  message: text("message").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  userId: text("user_id"),
  projectId: text("project_id"),
  durationMs: integer("duration_ms"),
  environment: varchar("environment", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("obs_log_correlation_idx").on(table.correlationId),
  index("obs_log_request_idx").on(table.requestId),
  index("obs_log_severity_idx").on(table.severity),
  index("obs_log_service_idx").on(table.service),
  index("obs_log_module_idx").on(table.module),
  index("obs_log_created_idx").on(table.createdAt),
]);

export const obsTrace = pgTable("obs_trace", {
  id: text("id").primaryKey(),
  traceId: varchar("trace_id", { length: 100 }).notNull(),
  parentId: varchar("parent_id", { length: 100 }),
  name: varchar("name", { length: 200 }).notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  operation: varchar("operation", { length: 100 }),
  status: varchar("status", { length: 50 }).default("ok").notNull(),
  durationMs: integer("duration_ms"),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  tags: jsonb("tags").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("obs_trace_traceId_idx").on(table.traceId),
  index("obs_trace_parentId_idx").on(table.parentId),
  index("obs_trace_service_idx").on(table.service),
  index("obs_trace_status_idx").on(table.status),
  index("obs_trace_startTime_idx").on(table.startTime),
]);

export const obsError = pgTable("obs_error", {
  id: text("id").primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }),
  severity: varchar("severity", { length: 20 }).default("error").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  service: varchar("service", { length: 100 }),
  module: varchar("module", { length: 100 }),
  endpoint: varchar("endpoint", { length: 500 }),
  method: varchar("method", { length: 10 }),
  statusCode: integer("status_code"),
  userId: text("user_id"),
  environment: varchar("environment", { length: 50 }),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  occurrences: integer("occurrences").default(1).notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("obs_error_correlation_idx").on(table.correlationId),
  index("obs_error_type_idx").on(table.type),
  index("obs_error_service_idx").on(table.service),
  index("obs_error_resolved_idx").on(table.resolved),
  index("obs_error_created_idx").on(table.createdAt),
]);

export const obsAlert = pgTable("obs_alert", {
  id: text("id").primaryKey(),
  ruleName: varchar("rule_name", { length: 200 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("firing").notNull(),
  correlationId: varchar("correlation_id", { length: 100 }),
  service: varchar("service", { length: 100 }),
  metricName: varchar("metric_name", { length: 200 }),
  metricValue: real("metric_value"),
  threshold: real("threshold"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("obs_alert_severity_idx").on(table.severity),
  index("obs_alert_status_idx").on(table.status),
  index("obs_alert_service_idx").on(table.service),
  index("obs_alert_created_idx").on(table.createdAt),
]);

export const obsDashboard = pgTable("obs_dashboard", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  layout: jsonb("layout").$type<Record<string, unknown>[]>().default([]).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const obsReport = pgTable("obs_report", {
  id: text("id").primaryKey(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  period: varchar("period", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("obs_report_type_idx").on(table.reportType),
  index("obs_report_generated_idx").on(table.generatedAt),
]);

export const obsRetentionPolicy = pgTable("obs_retention_policy", {
  id: text("id").primaryKey(),
  dataType: varchar("data_type", { length: 100 }).notNull(),
  retentionDays: integer("retention_days").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  lastCleanupAt: timestamp("last_cleanup_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const obsSettings = pgTable("obs_settings", {
  id: text("id").primaryKey(),
  metricsEnabled: boolean("metrics_enabled").default(true).notNull(),
  loggingEnabled: boolean("logging_enabled").default(true).notNull(),
  tracingEnabled: boolean("tracing_enabled").default(true).notNull(),
  alertingEnabled: boolean("alerting_enabled").default(true).notNull(),
  samplingRate: real("sampling_rate").default(1).notNull(),
  maxLogSize: integer("max_log_size").default(10000).notNull(),
  correlationEnabled: boolean("correlation_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const obsMetricRelations = relations(obsMetric, ({ one }) => ({}));
export const obsLogRelations = relations(obsLog, ({ one }) => ({}));
export const obsTraceRelations = relations(obsTrace, ({ one }) => ({}));
export const obsErrorRelations = relations(obsError, ({ one }) => ({}));
export const obsAlertRelations = relations(obsAlert, ({ one }) => ({}));
export const obsDashboardRelations = relations(obsDashboard, ({ one }) => ({}));
export const obsReportRelations = relations(obsReport, ({ one }) => ({}));
export const obsRetentionPolicyRelations = relations(obsRetentionPolicy, ({ one }) => ({}));
export const obsSettingsRelations = relations(obsSettings, ({ one }) => ({}));
