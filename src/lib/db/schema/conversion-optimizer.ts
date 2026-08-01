import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const conversionScore = pgTable("conversion_score", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  campaignId: text("campaign_id"),
  score: integer("score").default(0).notNull(),
  breakdown: jsonb("breakdown").$type<Record<string, number>>().default({}).notNull(),
  factors: jsonb("factors").$type<Array<{ name: string; value: number; weight: number; explanation: string }>>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
}, (table) => [
  index("conversion_score_user_idx").on(table.userId),
  index("conversion_score_project_idx").on(table.projectId),
]);

export const conversionRecommendation = pgTable("conversion_recommendation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  problem: text("problem"),
  reason: text("reason"),
  expectedBenefit: text("expected_benefit"),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  confidence: integer("confidence").default(50),
  platform: varchar("platform", { length: 50 }),
  status: varchar("status", { length: 50 }).default("new").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  implementedAt: timestamp("implemented_at"),
}, (table) => [
  index("conversion_rec_user_idx").on(table.userId),
  index("conversion_rec_project_idx").on(table.projectId),
  index("conversion_rec_type_idx").on(table.type),
  index("conversion_rec_priority_idx").on(table.priority),
]);

export const conversionExperiment = pgTable("conversion_experiment", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  variants: jsonb("variants").$type<Array<{ name: string; description: string; score: number }>>().default([]).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  winner: text("winner"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("conversion_experiment_user_idx").on(table.userId),
  index("conversion_experiment_status_idx").on(table.status),
]);

export const conversionReport = pgTable("conversion_report", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).default("generated").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("conversion_report_user_idx").on(table.userId),
]);

export const conversionScoreRelations = relations(conversionScore, ({ one }) => ({}));
export const conversionRecommendationRelations = relations(conversionRecommendation, ({ one }) => ({}));
export const conversionExperimentRelations = relations(conversionExperiment, ({ one }) => ({}));
export const conversionReportRelations = relations(conversionReport, ({ one }) => ({}));
