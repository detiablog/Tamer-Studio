import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const biReport = pgTable("bi_report", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  result: jsonb("result"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("bi_report_type_idx").on(table.type),
  index("bi_report_category_idx").on(table.category),
  index("bi_report_status_idx").on(table.status),
]);

export const biReportTemplate = pgTable("bi_report_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bi_report_template_category_idx").on(table.category),
]);

export const biSchedule = pgTable("bi_schedule", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  reportTemplateId: text("report_template_id"),
  scheduleType: varchar("schedule_type", { length: 50 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  recipients: jsonb("recipients").$type<string[]>().default([]).notNull(),
  format: varchar("format", { length: 50 }).default("csv").notNull(),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("bi_schedule_active_idx").on(table.isActive),
  index("bi_schedule_next_run_idx").on(table.nextRunAt),
]);

export const biKpi = pgTable("bi_kpi", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  currentValue: text("current_value").default("0").notNull(),
  targetValue: text("target_value").default("0").notNull(),
  unit: varchar("unit", { length: 50 }),
  trend: varchar("trend", { length: 20 }).default("flat").notNull(),
  status: varchar("status", { length: 50 }).default("normal").notNull(),
  owner: text("owner"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("bi_kpi_category_idx").on(table.category),
  index("bi_kpi_status_idx").on(table.status),
]);

export const biExport = pgTable("bi_export", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  reportId: text("report_id"),
  format: varchar("format", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  requestedBy: text("requested_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("bi_export_status_idx").on(table.status),
]);
