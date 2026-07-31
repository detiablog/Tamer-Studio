import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const analyticsEvent = pgTable("analytics_event", {
  id: text("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  userId: text("user_id"),
  sessionId: varchar("session_id", { length: 100 }),
  resourceId: text("resource_id"),
  resourceType: varchar("resource_type", { length: 50 }),
  value: text("value"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 10 }),
  language: varchar("language", { length: 10 }),
  device: varchar("device", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("analytics_event_type_idx").on(table.eventType),
  index("analytics_event_category_idx").on(table.category),
  index("analytics_event_user_idx").on(table.userId),
  index("analytics_event_source_idx").on(table.source),
  index("analytics_event_created_idx").on(table.createdAt),
]);

export const analyticsMetric = pgTable("analytics_metric", {
  id: text("id").primaryKey(),
  metricName: varchar("metric_name", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  value: text("value").notNull(),
  dimensions: jsonb("dimensions").$type<Record<string, string>>().default({}).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("analytics_metric_name_idx").on(table.metricName),
  index("analytics_metric_category_idx").on(table.category),
  index("analytics_metric_date_idx").on(table.date),
]);

export const analyticsDashboard = pgTable("analytics_dashboard", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  widgets: jsonb("widgets").$type<Array<{ id: string; type: string; config: Record<string, unknown>; position: { x: number; y: number; w: number; h: number } }>>().default([]).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("analytics_dashboard_user_idx").on(table.userId),
]);

export const analyticsReport = pgTable("analytics_report", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  result: jsonb("result"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("analytics_report_user_idx").on(table.userId),
  index("analytics_report_type_idx").on(table.type),
]);

export const analyticsAlert = pgTable("analytics_alert", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  metricName: varchar("metric_name", { length: 200 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  threshold: text("threshold").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("analytics_alert_user_idx").on(table.userId),
]);
