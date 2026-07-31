import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const systemHealth = pgTable("system_health", {
  id: text("id").primaryKey(),
  serviceName: varchar("service_name", { length: 100 }).notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("unknown").notNull(),
  latencyMs: integer("latency_ms"),
  uptime: text("uptime"),
  lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull(),
  lastHealthyAt: timestamp("last_healthy_at"),
  lastErrorAt: timestamp("last_error_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("system_health_service_idx").on(table.serviceName),
  index("system_health_type_idx").on(table.serviceType),
  index("system_health_status_idx").on(table.status),
]);

export const systemMetric = pgTable("system_metric", {
  id: text("id").primaryKey(),
  metricName: varchar("metric_name", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  value: text("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  source: varchar("source", { length: 100 }),
  dimensions: jsonb("dimensions").$type<Record<string, string>>().default({}).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => [
  index("system_metric_name_idx").on(table.metricName),
  index("system_metric_category_idx").on(table.category),
  index("system_metric_recorded_idx").on(table.recordedAt),
]);

export const systemAlert = pgTable("system_alert", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("warning").notNull(),
  condition: jsonb("condition").$type<Record<string, unknown>>().default({}).notNull(),
  serviceName: varchar("service_name", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  triggerCount: integer("trigger_count").default(0).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("system_alert_type_idx").on(table.type),
  index("system_alert_severity_idx").on(table.severity),
  index("system_alert_active_idx").on(table.isActive),
]);

export const systemIncident = pgTable("system_incident", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).default("minor").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  affectedServices: jsonb("affected_services").$type<string[]>().default([]).notNull(),
  timeline: jsonb("timeline").$type<Array<{ timestamp: string; action: string; note: string; admin: string }>>().default([]).notNull(),
  assignedTo: text("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("system_incident_status_idx").on(table.status),
  index("system_incident_severity_idx").on(table.severity),
]);

export const systemDependency = pgTable("system_dependency", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  dependsOn: jsonb("depends_on").$type<string[]>().default([]).notNull(),
  status: varchar("status", { length: 50 }).default("unknown").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("system_dependency_type_idx").on(table.type),
]);
