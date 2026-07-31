import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const imageProject = pgTable("image_project", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("image_project_user_idx").on(table.userId),
  index("image_project_status_idx").on(table.status),
]);

export const imageGeneration = pgTable("image_generation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  type: varchar("type", { length: 50 }).default("text_to_image").notNull(),
  style: varchar("style", { length: 100 }),
  aspectRatio: varchar("aspect_ratio", { length: 20 }).default("1:1").notNull(),
  resolution: varchar("resolution", { length: 20 }).default("1024x1024"),
  quality: varchar("quality", { length: 20 }).default("standard"),
  seed: integer("seed"),
  guidanceScale: text("guidance_scale"),
  steps: integer("steps"),
  model: varchar("model", { length: 200 }),
  provider: varchar("provider", { length: 100 }),
  characterId: text("character_id"),
  referenceImage: text("reference_image"),
  referenceStrength: text("reference_strength"),
  batchCount: integer("batch_count").default(1),
  outputImages: jsonb("output_images").$type<string[]>().default([]).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  error: text("error"),
  executionTimeMs: integer("execution_time_ms"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("image_generation_user_idx").on(table.userId),
  index("image_generation_project_idx").on(table.projectId),
  index("image_generation_status_idx").on(table.status),
  index("image_generation_type_idx").on(table.type),
  index("image_generation_created_idx").on(table.createdAt),
]);

export const imageStyle = pgTable("image_style", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  promptSuffix: text("prompt_suffix"),
  negativePromptSuffix: text("negative_prompt_suffix"),
  thumbnail: text("thumbnail"),
  isActive: boolean("is_active").default(true).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("image_style_category_idx").on(table.category),
  index("image_style_active_idx").on(table.isActive),
]);

export const imageCharacter = pgTable("image_character", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  avatar: text("avatar"),
  referenceImages: jsonb("reference_images").$type<string[]>().default([]).notNull(),
  style: varchar("style", { length: 100 }),
  promptTags: jsonb("prompt_tags").$type<string[]>().default([]).notNull(),
  defaultSettings: jsonb("default_settings").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("image_character_user_idx").on(table.userId),
]);

export const imagePromptLibrary = pgTable("image_prompt_library", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  prompt: text("prompt").notNull(),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  useCount: integer("use_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("image_prompt_library_user_idx").on(table.userId),
  index("image_prompt_library_category_idx").on(table.category),
]);

export const imageTemplate = pgTable("image_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  promptTemplate: text("prompt_template").notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  thumbnail: text("thumbnail"),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("image_template_category_idx").on(table.category),
  index("image_template_system_idx").on(table.isSystem),
]);

export const imageProjectRelations = relations(imageProject, ({ many }) => ({
  generations: many(imageGeneration),
}));

export const imageGenerationRelations = relations(imageGeneration, ({ one }) => ({
  project: one(imageProject, { fields: [imageGeneration.projectId], references: [imageProject.id] }),
}));
