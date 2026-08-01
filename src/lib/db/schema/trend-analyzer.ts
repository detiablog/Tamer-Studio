import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const trendTopic = pgTable("trend_topic", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  platforms: jsonb("platforms").$type<string[]>().default([]).notNull(),
  keywords: jsonb("keywords").$type<string[]>().default([]).notNull(),
  hashtags: jsonb("hashtags").$type<string[]>().default([]).notNull(),
  score: integer("score").default(0),
  velocity: text("velocity").default("stable"),
  status: varchar("status", { length: 50 }).default("discovered").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("trend_topic_user_idx").on(table.userId),
  index("trend_topic_category_idx").on(table.category),
  index("trend_topic_score_idx").on(table.score),
  index("trend_topic_status_idx").on(table.status),
]);

export const trendKeyword = pgTable("trend_keyword", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  keyword: varchar("keyword", { length: 200 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  popularity: integer("popularity").default(0),
  growth: integer("growth").default(0),
  competition: varchar("competition", { length: 20 }).default("low"),
  searchVolume: integer("search_volume"),
  relatedKeywords: jsonb("related_keywords").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("trend_keyword_user_idx").on(table.userId),
  index("trend_keyword_keyword_idx").on(table.keyword),
  index("trend_keyword_platform_idx").on(table.platform),
]);

export const trendHashtag = pgTable("trend_hashtag", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  hashtag: varchar("hashtag", { length: 200 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  postCount: integer("post_count").default(0),
  growth: integer("growth").default(0),
  category: varchar("category", { length: 100 }),
  confidence: integer("confidence").default(50),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trend_hashtag_user_idx").on(table.userId),
  index("trend_hashtag_platform_idx").on(table.platform),
]);

export const trendRecommendation = pgTable("trend_recommendation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topicId: text("topic_id").references(() => trendTopic.id, { onDelete: "set null" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 50 }),
  score: integer("score").default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isSaved: boolean("is_saved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trend_recommendation_user_idx").on(table.userId),
  index("trend_recommendation_topic_idx").on(table.topicId),
  index("trend_recommendation_type_idx").on(table.type),
]);

export const trendSaved = pgTable("trend_saved", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  topicId: text("topic_id").notNull().references(() => trendTopic.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trend_saved_user_idx").on(table.userId),
]);

export const trendForecast = pgTable("trend_forecast", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").notNull().references(() => trendTopic.id, { onDelete: "cascade" }),
  predictedPeak: timestamp("predicted_peak"),
  predictedDecline: timestamp("predicted_decline"),
  confidence: integer("confidence").default(50),
  contentWindow: varchar("content_window", { length: 100 }),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trend_forecast_topic_idx").on(table.topicId),
]);

export const trendAlert = pgTable("trend_alert", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  keyword: varchar("keyword", { length: 200 }),
  category: varchar("category", { length: 100 }),
  platform: varchar("platform", { length: 50 }),
  condition: varchar("condition", { length: 50 }).default("starts_trending").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trend_alert_user_idx").on(table.userId),
  index("trend_alert_active_idx").on(table.isActive),
]);

export const trendTopicRelations = relations(trendTopic, ({ many }) => ({
  recommendations: many(trendRecommendation),
  savedBy: many(trendSaved),
  forecast: many(trendForecast),
}));

export const trendRecommendationRelations = relations(trendRecommendation, ({ one }) => ({
  topic: one(trendTopic, { fields: [trendRecommendation.topicId], references: [trendTopic.id] }),
}));

export const trendSavedRelations = relations(trendSaved, ({ one }) => ({
  topic: one(trendTopic, { fields: [trendSaved.topicId], references: [trendTopic.id] }),
}));

export const trendForecastRelations = relations(trendForecast, ({ one }) => ({
  topic: one(trendTopic, { fields: [trendForecast.topicId], references: [trendTopic.id] }),
}));
