import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real } from "drizzle-orm/pg-core";

export const productKpi = pgTable("product_kpi", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  targetValue: real("target_value"),
  currentValue: real("current_value"),
  previousValue: real("previous_value"),
  unit: varchar("unit", { length: 50 }),
  status: varchar("status", { length: 50 }).default("unknown").notNull(),
  trend: varchar("trend", { length: 50 }).default("stable").notNull(),
  changePercent: real("change_percent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pki_name_idx").on(table.name),
  index("pki_category_idx").on(table.category),
  index("pki_recorded_idx").on(table.recordedAt),
]);

export const productMetric = pgTable("product_metric", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  value: real("value").notNull(),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pm_name_idx").on(table.name),
  index("pm_category_idx").on(table.category),
  index("pm_date_idx").on(table.date),
]);

export const productSegment = pgTable("product_segment", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  criteria: jsonb("criteria").$type<Record<string, unknown>>().default({}).notNull(),
  userCount: integer("user_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastCalculatedAt: timestamp("last_calculated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ps_name_idx").on(table.name),
  index("ps_active_idx").on(table.isActive),
]);

export const productCohort = pgTable("product_cohort", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  userCount: integer("user_count").default(0).notNull(),
  retentionData: jsonb("retention_data").$type<Record<string, number>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pc_type_idx").on(table.type),
  index("pc_period_idx").on(table.period),
]);

export const productFunnel = pgTable("product_funnel", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  steps: jsonb("steps").$type<Array<{ name: string; count: number; rate: number }>>().default([]).notNull(),
  totalUsers: integer("total_users").default(0).notNull(),
  conversionRate: real("conversion_rate"),
  period: varchar("period", { length: 20 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pf_name_idx").on(table.name),
  index("pf_period_idx").on(table.period),
]);

export const productForecast = pgTable("product_forecast", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  metric: varchar("metric", { length: 200 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  predictedValue: real("predicted_value").notNull(),
  confidenceLower: real("confidence_lower"),
  confidenceUpper: real("confidence_upper"),
  confidenceLevel: real("confidence_level").default(0.95),
  methodology: varchar("methodology", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pfc_name_idx").on(table.name),
  index("pfc_category_idx").on(table.category),
  index("pfc_metric_idx").on(table.metric),
  index("pfc_period_idx").on(table.period),
]);

export const productReport = pgTable("product_report", {
  id: text("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().default({}).notNull(),
  summary: text("summary"),
  period: varchar("period", { length: 100 }),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pr_type_idx").on(table.type),
  index("pr_period_idx").on(table.period),
  index("pr_generated_idx").on(table.generatedAt),
]);

export const productDashboard = pgTable("product_dashboard", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: varchar("name", { length: 200 }).notNull(),
  widgets: jsonb("widgets").$type<Array<{ id: string; type: string; config: Record<string, unknown>; position: { x: number; y: number; w: number; h: number } }>>().default([]).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pd_user_idx").on(table.userId),
  index("pd_default_idx").on(table.isDefault),
]);

export const productDecision = pgTable("product_decision", {
  id: text("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  recommendation: text("recommendation"),
  confidence: real("confidence"),
  rationale: text("rationale"),
  impact: varchar("impact", { length: 50 }),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pd_category_idx").on(table.category),
  index("pd_status_idx").on(table.status),
  index("pd_priority_idx").on(table.priority),
]);

export const productExport = pgTable("product_export", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  format: varchar("format", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pe_type_idx").on(table.type),
  index("pe_status_idx").on(table.status),
]);

export const productSettings = pgTable("product_settings", {
  id: text("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull(),
  value: jsonb("value").$type<Record<string, unknown>>().default({}).notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ps_key_idx").on(table.key),
]);
