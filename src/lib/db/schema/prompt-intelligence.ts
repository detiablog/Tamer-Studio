import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique, real } from "drizzle-orm/pg-core";

export const promptLibrary = pgTable("prompt_library", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  type: varchar("type", { length: 100 }).default("custom").notNull(),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  variables: jsonb("variables").$type<string[]>().default([]).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  qualityScore: integer("quality_score").default(0).notNull(),
  useCount: integer("use_count").default(0).notNull(),
  versionNumber: integer("version_number").default(1).notNull(),
  collectionId: text("collection_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("prompt_library_user_idx").on(table.userId),
  index("prompt_library_type_idx").on(table.type),
  index("prompt_library_category_idx").on(table.category),
  index("prompt_library_favorite_idx").on(table.userId, table.isFavorite),
]);

export const promptTemplates = pgTable("prompt_templates", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  variables: jsonb("variables").$type<string[]>().default([]).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("prompt_template_type_idx").on(table.type),
  index("prompt_template_category_idx").on(table.category),
]);

export const promptVariables = pgTable("prompt_variables", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  isDefault: boolean("is_default").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("prompt_var_user_idx").on(table.userId),
  unique("prompt_var_user_key_unique").on(table.userId, table.key),
]);

export const promptVersions = pgTable("prompt_versions", {
  id: text("id").primaryKey(),
  promptId: text("prompt_id").notNull(),
  userId: text("user_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  content: text("content").notNull(),
  changes: text("changes"),
  qualityScore: integer("quality_score").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("prompt_ver_prompt_idx").on(table.promptId),
  index("prompt_ver_user_idx").on(table.userId),
]);

export const promptHistory = pgTable("prompt_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: text("prompt_id"),
  versionNumber: integer("version_number"),
  resolvedPrompt: text("resolved_prompt").notNull(),
  provider: varchar("provider", { length: 100 }),
  model: varchar("model", { length: 200 }),
  creditsUsed: integer("credits_used").default(0).notNull(),
  executionTimeMs: integer("execution_time_ms").default(0).notNull(),
  resultReference: text("result_reference"),
  projectReference: text("project_reference"),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("prompt_hist_user_idx").on(table.userId),
  index("prompt_hist_prompt_idx").on(table.promptId),
  index("prompt_hist_created_idx").on(table.createdAt),
]);

export const promptCollections = pgTable("prompt_collections", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }),
  isPinned: boolean("is_pinned").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("prompt_collection_user_idx").on(table.userId),
]);

export const promptTests = pgTable("prompt_tests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: text("prompt_id"),
  versionNumber: integer("version_number"),
  testName: varchar("test_name", { length: 200 }).notNull(),
  resolvedPrompt: text("resolved_prompt").notNull(),
  provider: varchar("provider", { length: 100 }),
  model: varchar("model", { length: 200 }),
  estimatedTokens: integer("estimated_tokens").default(0).notNull(),
  estimatedCredits: integer("estimated_credits").default(0).notNull(),
  actualCredits: integer("actual_credits").default(0).notNull(),
  executionTimeMs: integer("execution_time_ms").default(0).notNull(),
  result: jsonb("result").$type<Record<string, unknown>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("prompt_test_user_idx").on(table.userId),
  index("prompt_test_prompt_idx").on(table.promptId),
]);

export const promptAnalytics = pgTable("prompt_analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  promptId: text("prompt_id"),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  value: real("value").notNull(),
  provider: varchar("provider", { length: 100 }),
  model: varchar("model", { length: 200 }),
  dimensions: jsonb("dimensions").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("prompt_analytics_user_idx").on(table.userId),
  index("prompt_analytics_prompt_idx").on(table.promptId),
]);

export const promptSettings = pgTable("prompt_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  autoOptimize: boolean("auto_optimize").default(true).notNull(),
  autoInjectContext: boolean("auto_inject_context").default(true).notNull(),
  autoValidate: boolean("auto_validate").default(true).notNull(),
  defaultType: varchar("default_type", { length: 50 }).default("custom").notNull(),
  maxPromptLength: integer("max_prompt_length").default(4000).notNull(),
  showQualityScore: boolean("show_quality_score").default(true).notNull(),
  notificationEnabled: boolean("notification_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const promptLibraryRelations = relations(promptLibrary, ({ one }) => ({
  collection: one(promptCollections, { fields: [promptLibrary.collectionId], references: [promptCollections.id] }),
}));

export const promptTemplatesRelations = relations(promptTemplates, ({ one }) => ({}));
export const promptVariablesRelations = relations(promptVariables, ({ one }) => ({}));
export const promptVersionsRelations = relations(promptVersions, ({ one }) => ({}));
export const promptHistoryRelations = relations(promptHistory, ({ one }) => ({}));
export const promptCollectionsRelations = relations(promptCollections, ({ many }) => ({
  prompts: many(promptLibrary),
}));
export const promptTestsRelations = relations(promptTests, ({ one }) => ({}));
export const promptAnalyticsRelations = relations(promptAnalytics, ({ one }) => ({}));
export const promptSettingsRelations = relations(promptSettings, ({ one }) => ({}));
