import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real, unique } from "drizzle-orm/pg-core";

export const qualityReport = pgTable("quality_report", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  assetId: text("asset_id"),
  assetType: varchar("asset_type", { length: 50 }).notNull(),
  moduleType: varchar("module_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  overallScore: integer("overall_score").default(0).notNull(),
  passed: boolean("passed").default(false).notNull(),
  requiresReview: boolean("requires_review").default(false).notNull(),
  summary: text("summary"),
  scores: jsonb("scores").$type<Record<string, number>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("quality_report_user_idx").on(table.userId),
  index("quality_report_project_idx").on(table.projectId),
  index("quality_report_asset_idx").on(table.assetId),
  index("quality_report_type_idx").on(table.assetType),
  index("quality_report_status_idx").on(table.status),
]);

export const qualityScore = pgTable("quality_score", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull(),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  score: integer("score").notNull(),
  explanation: text("explanation"),
  weight: real("weight").default(1).notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quality_score_report_idx").on(table.reportId),
  index("quality_score_user_idx").on(table.userId),
]);

export const qualityValidation = pgTable("quality_validation", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull(),
  userId: text("user_id").notNull(),
  validatorType: varchar("validator_type", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  passed: boolean("passed").default(false).notNull(),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  message: text("message"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quality_validation_report_idx").on(table.reportId),
  index("quality_validation_user_idx").on(table.userId),
]);

export const qualityRecommendation = pgTable("quality_recommendation", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull(),
  userId: text("user_id").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  impact: integer("impact").default(0).notNull(),
  action: varchar("action", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("quality_rec_report_idx").on(table.reportId),
  index("quality_rec_user_idx").on(table.userId),
]);

export const qualityRetryHistory = pgTable("quality_retry_history", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id"),
  retryCount: integer("retry_count").default(1).notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default("started").notNull(),
  provider: varchar("provider", { length: 100 }),
  model: varchar("model", { length: 200 }),
  scoreBefore: integer("score_before").default(0).notNull(),
  scoreAfter: integer("score_after").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quality_retry_report_idx").on(table.reportId),
  index("quality_retry_user_idx").on(table.userId),
]);

export const qualityRule = pgTable("quality_rule", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  minScore: integer("min_score").default(70).notNull(),
  autoRetryThreshold: integer("auto_retry_threshold").default(50).notNull(),
  maxRetryCount: integer("max_retry_count").default(3).notNull(),
  ignoredValidators: jsonb("ignored_validators").$type<string[]>().default([]).notNull(),
  mode: varchar("mode", { length: 50 }).default("balanced").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("quality_rule_user_idx").on(table.userId),
  index("quality_rule_category_idx").on(table.category),
]);

export const qualityThreshold = pgTable("quality_threshold", {
  id: text("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  minValue: integer("min_value").default(60).notNull(),
  maxValue: integer("max_value").default(100).notNull(),
  weight: real("weight").default(1).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const qualitySettings = pgTable("quality_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  strictMode: boolean("strict_mode").default(false).notNull(),
  autoRetryEnabled: boolean("auto_retry_enabled").default(true).notNull(),
  autoRetryThreshold: integer("auto_retry_threshold").default(50).notNull(),
  maxRetryCount: integer("max_retry_count").default(3).notNull(),
  defaultMinScore: integer("default_min_score").default(70).notNull(),
  skipValidation: boolean("skip_validation").default(false).notNull(),
  notifyOnPass: boolean("notify_on_pass").default(false).notNull(),
  notifyOnFail: boolean("notify_on_fail").default(true).notNull(),
  enabledValidators: jsonb("enabled_validators").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const qualityAuditLog = pgTable("quality_audit_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  reportId: text("report_id"),
  assetId: text("asset_id"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quality_audit_user_idx").on(table.userId),
  index("quality_audit_report_idx").on(table.reportId),
]);

export const qualityReportRelations = relations(qualityReport, ({ many }) => ({
  scores: many(qualityScore),
  validations: many(qualityValidation),
  recommendations: many(qualityRecommendation),
  retries: many(qualityRetryHistory),
}));

export const qualityScoreRelations = relations(qualityScore, ({ one }) => ({
  report: one(qualityReport, { fields: [qualityScore.reportId], references: [qualityReport.id] }),
}));

export const qualityValidationRelations = relations(qualityValidation, ({ one }) => ({
  report: one(qualityReport, { fields: [qualityValidation.reportId], references: [qualityReport.id] }),
}));

export const qualityRecommendationRelations = relations(qualityRecommendation, ({ one }) => ({
  report: one(qualityReport, { fields: [qualityRecommendation.reportId], references: [qualityReport.id] }),
}));

export const qualityRetryHistoryRelations = relations(qualityRetryHistory, ({ one }) => ({
  report: one(qualityReport, { fields: [qualityRetryHistory.reportId], references: [qualityReport.id] }),
}));

export const qualityRuleRelations = relations(qualityRule, ({ one }) => ({}));
export const qualityThresholdRelations = relations(qualityThreshold, ({ one }) => ({}));
export const qualitySettingsRelations = relations(qualitySettings, ({ one }) => ({}));
export const qualityAuditLogRelations = relations(qualityAuditLog, ({ one }) => ({}));
