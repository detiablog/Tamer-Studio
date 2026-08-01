import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const videoProject = pgTable("video_project", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("video_project_user_idx").on(table.userId),
  index("video_project_status_idx").on(table.status),
]);

export const videoStoryboard = pgTable("video_storyboard", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => videoProject.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("video_storyboard_project_idx").on(table.projectId),
  index("video_storyboard_user_idx").on(table.userId),
]);

export const videoScene = pgTable("video_scene", {
  id: text("id").primaryKey(),
  storyboardId: text("storyboard_id").notNull().references(() => videoStoryboard.id, { onDelete: "cascade" }),
  order: integer("order").default(0).notNull(),
  title: varchar("title", { length: 200 }),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  duration: integer("duration").default(5),
  cameraMotion: varchar("camera_motion", { length: 50 }).default("static"),
  transition: varchar("transition", { length: 50 }).default("cut"),
  characters: jsonb("characters").$type<string[]>().default([]).notNull(),
  audio: jsonb("audio").$type<Record<string, unknown>>().default({}).notNull(),
  subtitles: jsonb("subtitles").$type<Array<{ text: string; startTime: number; endTime: number }>>().default([]).notNull(),
  effects: jsonb("effects").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("video_scene_storyboard_idx").on(table.storyboardId),
]);

export const videoGeneration = pgTable("video_generation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  storyboardId: text("storyboard_id"),
  sceneId: text("scene_id"),
  type: varchar("type", { length: 50 }).default("text_to_video").notNull(),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  style: varchar("style", { length: 100 }),
  aspectRatio: varchar("aspect_ratio", { length: 20 }).default("16:9"),
  resolution: varchar("resolution", { length: 20 }).default("720p"),
  frameRate: integer("frame_rate").default(24),
  duration: integer("duration").default(5),
  quality: varchar("quality", { length: 20 }).default("standard"),
  seed: integer("seed"),
  model: varchar("model", { length: 200 }),
  provider: varchar("provider", { length: 100 }),
  referenceImage: text("reference_image"),
  referenceVideo: text("reference_video"),
  outputVideo: text("output_video"),
  thumbnail: text("thumbnail"),
  previewClip: text("preview_clip"),
  creditsUsed: integer("credits_used").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  error: text("error"),
  executionTimeMs: integer("execution_time_ms"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("video_generation_user_idx").on(table.userId),
  index("video_generation_project_idx").on(table.projectId),
  index("video_generation_storyboard_idx").on(table.storyboardId),
  index("video_generation_status_idx").on(table.status),
  index("video_generation_created_idx").on(table.createdAt),
]);

export const videoTemplate = pgTable("video_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  scenes: jsonb("scenes").$type<Record<string, unknown>[]>().default([]).notNull(),
  thumbnail: text("thumbnail"),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("video_template_category_idx").on(table.category),
]);

export const videoEffect = pgTable("video_effect", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("video_effect_category_idx").on(table.category),
]);

export const videoTransition = pgTable("video_transition", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  duration: integer("duration").default(1),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("video_transition_category_idx").on(table.category),
]);

export const videoProjectRelations = relations(videoProject, ({ many }) => ({
  storyboards: many(videoStoryboard),
}));

export const videoStoryboardRelations = relations(videoStoryboard, ({ one, many }) => ({
  project: one(videoProject, { fields: [videoStoryboard.projectId], references: [videoProject.id] }),
  scenes: many(videoScene),
}));

export const videoSceneRelations = relations(videoScene, ({ one }) => ({
  storyboard: one(videoStoryboard, { fields: [videoScene.storyboardId], references: [videoStoryboard.id] }),
}));
