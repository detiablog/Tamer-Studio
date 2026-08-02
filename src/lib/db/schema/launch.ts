import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real } from "drizzle-orm/pg-core";

export const launchChecklist = pgTable("launch_checklist", {
  id: text("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  item: varchar("item", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  assignedTo: text("assigned_to"),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("launch_check_category_idx").on(table.category),
  index("launch_check_status_idx").on(table.status),
]);

export const launchCertification = pgTable("launch_certification", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  overallScore: integer("overall_score").default(0).notNull(),
  criticalIssues: integer("critical_issues").default(0).notNull(),
  highIssues: integer("high_issues").default(0).notNull(),
  mediumIssues: integer("medium_issues").default(0).notNull(),
  lowIssues: integer("low_issues").default(0).notNull(),
  checks: jsonb("checks").$type<Record<string, string>>().default({}).notNull(),
  certifiedBy: text("certified_by"),
  certifiedAt: timestamp("certified_at"),
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("launch_cert_status_idx").on(table.status),
  index("launch_cert_version_idx").on(table.version),
]);

export const launchReport = pgTable("launch_report", {
  id: text("id").primaryKey(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("launch_report_type_idx").on(table.reportType),
  index("launch_report_generated_idx").on(table.generatedAt),
]);

export const launchMetric = pgTable("launch_metric", {
  id: text("id").primaryKey(),
  metricName: varchar("metric_name", { length: 200 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("launch_metric_name_idx").on(table.metricName),
  index("launch_metric_created_idx").on(table.createdAt),
]);

export const launchEvent = pgTable("launch_event", {
  id: text("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("launch_event_type_idx").on(table.eventType),
  index("launch_event_created_idx").on(table.createdAt),
]);

export const launchSettings = pgTable("launch_settings", {
  id: text("id").primaryKey(),
  launchVersion: varchar("launch_version", { length: 50 }).default("1.0.0").notNull(),
  launchDate: timestamp("launch_date"),
  isPublicRegistrationEnabled: boolean("is_public_registration_enabled").default(true).notNull(),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  emergencyBanner: text("emergency_banner"),
  launchFreeze: boolean("launch_freeze").default(false).notNull(),
  statusPage: varchar("status_page", { length: 500 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const launchChecklistRelations = relations(launchChecklist, ({ one }) => ({}));
export const launchCertificationRelations = relations(launchCertification, ({ one }) => ({}));
export const launchReportRelations = relations(launchReport, ({ one }) => ({}));
export const launchMetricRelations = relations(launchMetric, ({ one }) => ({}));
export const launchEventRelations = relations(launchEvent, ({ one }) => ({}));
export const launchSettingsRelations = relations(launchSettings, ({ one }) => ({}));
