import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real, unique } from "drizzle-orm/pg-core";

export const opsAlert = pgTable("ops_alert", {
  id: text("id").primaryKey(),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  source: varchar("source", { length: 100 }),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  assignedTo: text("assigned_to"),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ops_alert_severity_idx").on(table.severity),
  index("ops_alert_category_idx").on(table.category),
  index("ops_alert_status_idx").on(table.status),
  index("ops_alert_created_idx").on(table.createdAt),
]);

export const opsIncident = pgTable("ops_incident", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  affectedServices: jsonb("affected_services").$type<string[]>().default([]).notNull(),
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  assignedTo: text("assigned_to"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  impact: varchar("impact", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ops_incident_severity_idx").on(table.severity),
  index("ops_incident_status_idx").on(table.status),
  index("ops_incident_category_idx").on(table.category),
]);

export const opsHealthSnapshot = pgTable("ops_health_snapshot", {
  id: text("id").primaryKey(),
  overallStatus: varchar("overall_status", { length: 50 }).default("healthy").notNull(),
  databaseStatus: varchar("database_status", { length: 50 }),
  redisStatus: varchar("redis_status", { length: 50 }),
  storageStatus: varchar("storage_status", { length: 50 }),
  aiRuntimeStatus: varchar("ai_runtime_status", { length: 50 }),
  smtpStatus: varchar("smtp_status", { length: 50 }),
  queueStatus: varchar("queue_status", { length: 50 }),
  workerStatus: varchar("worker_status", { length: 50 }),
  databaseLatencyMs: integer("database_latency_ms"),
  redisLatencyMs: integer("redis_latency_ms"),
  totalUsers: integer("total_users"),
  activeUsers: integer("active_users"),
  totalSessions: integer("total_sessions"),
  cpuUsage: real("cpu_usage"),
  memoryUsage: real("memory_usage"),
  diskUsage: real("disk_usage"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ops_health_created_idx").on(table.createdAt),
  index("ops_health_status_idx").on(table.overallStatus),
]);

export const opsWorkerLog = pgTable("ops_worker_log", {
  id: text("id").primaryKey(),
  workerId: varchar("worker_id", { length: 100 }).notNull(),
  jobId: varchar("job_id", { length: 100 }),
  jobType: varchar("job_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default("running").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("ops_worker_worker_idx").on(table.workerId),
  index("ops_worker_status_idx").on(table.status),
  index("ops_worker_started_idx").on(table.startedAt),
]);

export const opsDeployment = pgTable("ops_deployment", {
  id: text("id").primaryKey(),
  version: varchar("version", { length: 50 }).notNull(),
  commitHash: varchar("commit_hash", { length: 40 }),
  environment: varchar("environment", { length: 50 }).default("production").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  deployedBy: text("deployed_by"),
  notes: text("notes"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  rollbackAvailable: boolean("rollback_available").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("ops_deploy_status_idx").on(table.status),
  index("ops_deploy_env_idx").on(table.environment),
  index("ops_deploy_started_idx").on(table.startedAt),
]);

export const opsMaintenance = pgTable("ops_maintenance", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  message: text("message"),
  whitelistedUsers: jsonb("whitelisted_users").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ops_maint_status_idx").on(table.status),
]);

export const opsAuditEvent = pgTable("ops_audit_event", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: varchar("action", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: text("entity_id"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ops_audit_user_idx").on(table.userId),
  index("ops_audit_action_idx").on(table.action),
  index("ops_audit_category_idx").on(table.category),
  index("ops_audit_created_idx").on(table.createdAt),
]);

export const opsMetric = pgTable("ops_metric", {
  id: text("id").primaryKey(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ops_metric_name_idx").on(table.metricName),
  index("ops_metric_category_idx").on(table.category),
  index("ops_metric_created_idx").on(table.createdAt),
]);

export const opsReport = pgTable("ops_report", {
  id: text("id").primaryKey(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  period: varchar("period", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedBy: text("generated_by"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("ops_report_type_idx").on(table.reportType),
  index("ops_report_generated_idx").on(table.generatedAt),
]);

export const opsSettings = pgTable("ops_settings", {
  id: text("id").primaryKey(),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  maintenanceMessage: text("maintenance_message"),
  maintenanceWhitelist: jsonb("maintenance_whitelist").$type<string[]>().default([]).notNull(),
  alertEmails: jsonb("alert_emails").$type<string[]>().default([]).notNull(),
  alertWebhooks: jsonb("alert_webhooks").$type<string[]>().default([]).notNull(),
  healthCheckIntervalMs: integer("health_check_interval_ms").default(60000).notNull(),
  autoResolveIncidents: boolean("auto_resolve_incidents").default(false).notNull(),
  retentionDays: integer("retention_days").default(90).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const opsAlertRelations = relations(opsAlert, ({ one }) => ({}));
export const opsIncidentRelations = relations(opsIncident, ({ one }) => ({}));
export const opsHealthSnapshotRelations = relations(opsHealthSnapshot, ({ one }) => ({}));
export const opsWorkerLogRelations = relations(opsWorkerLog, ({ one }) => ({}));
export const opsDeploymentRelations = relations(opsDeployment, ({ one }) => ({}));
export const opsMaintenanceRelations = relations(opsMaintenance, ({ one }) => ({}));
export const opsAuditEventRelations = relations(opsAuditEvent, ({ one }) => ({}));
export const opsMetricRelations = relations(opsMetric, ({ one }) => ({}));
export const opsReportRelations = relations(opsReport, ({ one }) => ({}));
export const opsSettingsRelations = relations(opsSettings, ({ one }) => ({}));
