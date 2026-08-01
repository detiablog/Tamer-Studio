import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real, unique } from "drizzle-orm/pg-core";

export const learningEvent = pgTable("learning_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  source: varchar("source", { length: 100 }),
  entityId: text("entity_id"),
  entityType: varchar("entity_type", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  weight: real("weight").default(1).notNull(),
  processed: boolean("processed").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("learn_event_user_idx").on(table.userId),
  index("learn_event_type_idx").on(table.eventType),
  index("learn_event_category_idx").on(table.category),
  index("learn_event_processed_idx").on(table.processed),
  index("learn_event_created_idx").on(table.createdAt),
]);

export const learningPattern = pgTable("learning_pattern", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  patternName: varchar("pattern_name", { length: 200 }).notNull(),
  patternType: varchar("pattern_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  value: jsonb("value").$type<unknown>().notNull(),
  confidence: integer("confidence").default(0).notNull(),
  sampleSize: integer("sample_size").default(0).notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("learn_pattern_user_idx").on(table.userId),
  index("learn_pattern_type_idx").on(table.patternType),
  index("learn_pattern_category_idx").on(table.category),
  index("learn_pattern_confidence_idx").on(table.confidence),
]);

export const learningPreference = pgTable("learning_preference", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: integer("confidence").default(50).notNull(),
  source: varchar("source", { length: 100 }),
  isEditable: boolean("is_editable").default(true).notNull(),
  isUserOverride: boolean("is_user_override").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("learn_pref_user_idx").on(table.userId),
  index("learn_pref_category_idx").on(table.category),
  unique("learn_pref_user_key_unique").on(table.userId, table.key),
]);

export const learningRecommendation = pgTable("learning_recommendation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  reason: text("reason"),
  expectedBenefit: text("expected_benefit"),
  confidence: integer("confidence").default(50).notNull(),
  priority: integer("priority").default(50).notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: text("entity_id"),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("learn_rec_user_idx").on(table.userId),
  index("learn_rec_category_idx").on(table.category),
  index("learn_rec_status_idx").on(table.status),
  index("learn_rec_priority_idx").on(table.priority),
]);

export const learningFeedback = pgTable("learning_feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: text("entity_id").notNull(),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("learn_feed_user_idx").on(table.userId),
  index("learn_feed_entity_idx").on(table.entityId),
  index("learn_feed_type_idx").on(table.entityType),
]);

export const learningGoal = pgTable("learning_goal", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  targetValue: real("target_value"),
  currentValue: real("current_value").default(0).notNull(),
  unit: varchar("unit", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  priority: integer("priority").default(50).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("learn_goal_user_idx").on(table.userId),
  index("learn_goal_status_idx").on(table.status),
]);

export const learningHistory = pgTable("learning_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  entityId: text("entity_id"),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("learn_hist_user_idx").on(table.userId),
  index("learn_hist_type_idx").on(table.eventType),
  index("learn_hist_created_idx").on(table.createdAt),
]);

export const learningReport = pgTable("learning_report", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  period: varchar("period", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("learn_report_user_idx").on(table.userId),
  index("learn_report_type_idx").on(table.reportType),
]);

export const learningSettings = pgTable("learning_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  learningEnabled: boolean("learning_enabled").default(true).notNull(),
  learningPaused: boolean("learning_paused").default(false).notNull(),
  confidenceThreshold: integer("confidence_threshold").default(30).notNull(),
  maxEventsPerDay: integer("max_events_per_day").default(500).notNull(),
  retentionDays: integer("retention_days").default(365).notNull(),
  excludedCategories: jsonb("excluded_categories").$type<string[]>().default([]).notNull(),
  notificationEnabled: boolean("notification_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const learningEventRelations = relations(learningEvent, ({ one }) => ({}));
export const learningPatternRelations = relations(learningPattern, ({ one }) => ({}));
export const learningPreferenceRelations = relations(learningPreference, ({ one }) => ({}));
export const learningRecommendationRelations = relations(learningRecommendation, ({ one }) => ({}));
export const learningFeedbackRelations = relations(learningFeedback, ({ one }) => ({}));
export const learningGoalRelations = relations(learningGoal, ({ one }) => ({}));
export const learningHistoryRelations = relations(learningHistory, ({ one }) => ({}));
export const learningReportRelations = relations(learningReport, ({ one }) => ({}));
export const learningSettingsRelations = relations(learningSettings, ({ one }) => ({}));
