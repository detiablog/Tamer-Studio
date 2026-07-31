import { pgTable, text, timestamp, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const performanceMetric = pgTable("performance_metric", {
  id: text("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  metricName: varchar("metric_name", { length: 200 }).notNull(),
  value: text("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => [
  index("performance_metric_category_idx").on(table.category),
  index("performance_metric_name_idx").on(table.metricName),
  index("performance_metric_recorded_idx").on(table.recordedAt),
]);

export const performanceReport = pgTable("performance_report", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  scores: jsonb("scores").$type<Record<string, number>>().default({}).notNull(),
  recommendations: jsonb("recommendations").$type<Array<{ category: string; title: string; impact: string; fix: string }>>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("performance_report_created_idx").on(table.createdAt),
]);
