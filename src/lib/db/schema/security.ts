import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real } from "drizzle-orm/pg-core";

export const secEvent = pgTable("sec_event", {
  id: text("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }),
  userId: text("user_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  resource: varchar("resource", { length: 200 }),
  action: varchar("action", { length: 100 }),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  blocked: boolean("blocked").default(false).notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_event_type_idx").on(table.eventType),
  index("sec_event_severity_idx").on(table.severity),
  index("sec_event_category_idx").on(table.category),
  index("sec_event_user_idx").on(table.userId),
  index("sec_event_created_idx").on(table.createdAt),
]);

export const secIncident = pgTable("sec_incident", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  affectedSystems: jsonb("affected_systems").$type<string[]>().default([]).notNull(),
  eventIds: jsonb("event_ids").$type<string[]>().default([]).notNull(),
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  assignedTo: text("assigned_to"),
  impact: varchar("impact", { length: 50 }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("sec_incident_severity_idx").on(table.severity),
  index("sec_incident_status_idx").on(table.status),
  index("sec_incident_category_idx").on(table.category),
]);

export const secSession = pgTable("sec_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  device: varchar("device", { length: 200 }),
  location: varchar("location", { length: 200 }),
  isActive: boolean("is_active").default(true).notNull(),
  isSuspicious: boolean("is_suspicious").default(false).notNull(),
  riskScore: integer("risk_score").default(0).notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_session_user_idx").on(table.userId),
  index("sec_session_active_idx").on(table.isActive),
  index("sec_session_suspicious_idx").on(table.isSuspicious),
]);

export const secApiEvent = pgTable("sec_api_event", {
  id: text("id").primaryKey(),
  correlationId: varchar("correlation_id", { length: 100 }),
  userId: text("user_id"),
  method: varchar("method", { length: 10 }).notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  statusCode: integer("status_code"),
  latencyMs: integer("latency_ms"),
  requestSize: integer("request_size"),
  responseSize: integer("response_size"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  rateLimited: boolean("rate_limited").default(false).notNull(),
  blocked: boolean("blocked").default(false).notNull(),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_api_correlation_idx").on(table.correlationId),
  index("sec_api_user_idx").on(table.userId),
  index("sec_api_endpoint_idx").on(table.endpoint),
  index("sec_api_created_idx").on(table.createdAt),
]);

export const secUploadEvent = pgTable("sec_upload_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  filename: varchar("filename", { length: 500 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"),
  storagePath: text("storage_path"),
  isValid: boolean("is_valid").default(true).notNull(),
  isSuspicious: boolean("is_suspicious").default(false).notNull(),
  validationErrors: jsonb("validation_errors").$type<string[]>().default([]).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("sec_upload_user_idx").on(table.userId),
  index("sec_upload_valid_idx").on(table.isValid),
  index("sec_upload_suspicious_idx").on(table.isSuspicious),
]);

export const secReport = pgTable("sec_report", {
  id: text("id").primaryKey(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  period: varchar("period", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("sec_report_type_idx").on(table.reportType),
  index("sec_report_generated_idx").on(table.generatedAt),
]);

export const secCompliance = pgTable("sec_compliance", {
  id: text("id").primaryKey(),
  framework: varchar("framework", { length: 100 }).notNull(),
  control: varchar("control", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  lastVerifiedAt: timestamp("last_verified_at"),
  evidence: jsonb("evidence").$type<string[]>().default([]).notNull(),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("sec_compliance_framework_idx").on(table.framework),
  index("sec_compliance_status_idx").on(table.status),
]);

export const secSettings = pgTable("sec_settings", {
  id: text("id").primaryKey(),
  bruteForceProtection: boolean("brute_force_protection").default(true).notNull(),
  maxLoginAttempts: integer("max_login_attempts").default(5).notNull(),
  lockoutDurationMinutes: integer("lockout_duration_minutes").default(30).notNull(),
  sessionTimeoutMinutes: integer("session_timeout_minutes").default(60).notNull(),
  maxConcurrentSessions: integer("max_concurrent_sessions").default(5).notNull(),
  ipWhitelist: jsonb("ip_whitelist").$type<string[]>().default([]).notNull(),
  ipBlacklist: jsonb("ip_blacklist").$type<string[]>().default([]).notNull(),
  uploadMaxSizeMb: integer("upload_max_size_mb").default(100).notNull(),
  uploadAllowedTypes: jsonb("upload_allowed_types").$type<string[]>().default(["image/*", "video/*", "application/pdf"]).notNull(),
  rateLimitEnabled: boolean("rate_limit_enabled").default(true).notNull(),
  cspEnabled: boolean("csp_enabled").default(true).notNull(),
  hstsEnabled: boolean("hsts_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const secEventRelations = relations(secEvent, ({ one }) => ({}));
export const secIncidentRelations = relations(secIncident, ({ one }) => ({}));
export const secSessionRelations = relations(secSession, ({ one }) => ({}));
export const secApiEventRelations = relations(secApiEvent, ({ one }) => ({}));
export const secUploadEventRelations = relations(secUploadEvent, ({ one }) => ({}));
export const secReportRelations = relations(secReport, ({ one }) => ({}));
export const secComplianceRelations = relations(secCompliance, ({ one }) => ({}));
export const secSettingsRelations = relations(secSettings, ({ one }) => ({}));
