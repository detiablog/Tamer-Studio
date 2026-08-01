import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const dramaProject = pgTable("drama_project", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  coverImage: text("cover_image"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("drama_project_user_idx").on(table.userId),
  index("drama_project_status_idx").on(table.status),
  index("drama_project_genre_idx").on(table.genre),
]);

export const dramaUniverse = pgTable("drama_universe", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => dramaProject.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  timeline: jsonb("timeline").$type<Array<{ era: string; events: string[] }>>().default([]).notNull(),
  rules: jsonb("rules").$type<Record<string, unknown>>().default({}).notNull(),
  locations: jsonb("locations").$type<string[]>().default([]).notNull(),
  lore: text("lore"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("drama_universe_project_idx").on(table.projectId),
]);

export const dramaCharacter = pgTable("drama_character", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => dramaProject.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  role: varchar("role", { length: 50 }).default("supporting"),
  description: text("description"),
  personality: text("personality"),
  goals: text("goals"),
  appearance: text("appearance"),
  speechStyle: text("speech_style"),
  avatar: text("avatar"),
  referenceImages: jsonb("reference_images").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("drama_character_project_idx").on(table.projectId),
]);

export const dramaLocation = pgTable("drama_location", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => dramaProject.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  environment: text("environment"),
  lighting: text("lighting"),
  weather: text("weather"),
  referenceImages: jsonb("reference_images").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("drama_location_project_idx").on(table.projectId),
]);

export const dramaEpisode = pgTable("drama_episode", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => dramaProject.id, { onDelete: "cascade" }),
  season: integer("season").default(1),
  episodeNumber: integer("episode_number").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  synopsis: text("synopsis"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  duration: integer("duration"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("drama_episode_project_idx").on(table.projectId),
  index("drama_episode_season_idx").on(table.season),
]);

export const dramaScene = pgTable("drama_scene", {
  id: text("id").primaryKey(),
  episodeId: text("episode_id").notNull().references(() => dramaEpisode.id, { onDelete: "cascade" }),
  order: integer("order").default(0).notNull(),
  title: varchar("title", { length: 200 }),
  description: text("description"),
  dialogue: jsonb("dialogue").$type<Array<{ characterId: string; text: string; emotion?: string }>>().default([]).notNull(),
  narration: text("narration"),
  locationId: text("location_id"),
  characters: jsonb("characters").$type<string[]>().default([]).notNull(),
  cameraDirection: varchar("camera_direction", { length: 100 }),
  transition: varchar("transition", { length: 50 }).default("cut"),
  duration: integer("duration").default(5),
  emotion: varchar("emotion", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("drama_scene_episode_idx").on(table.episodeId),
]);

export const dramaGenerationJob = pgTable("drama_generation_job", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => dramaProject.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  input: jsonb("input").$type<Record<string, unknown>>().default({}).notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().default({}).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  error: text("error"),
  executionTimeMs: integer("execution_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("drama_gen_job_project_idx").on(table.projectId),
  index("drama_gen_job_user_idx").on(table.userId),
  index("drama_gen_job_status_idx").on(table.status),
]);

export const dramaTemplate = pgTable("drama_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("drama_template_genre_idx").on(table.genre),
]);

export const dramaProjectRelations = relations(dramaProject, ({ many }) => ({
  universes: many(dramaUniverse),
  characters: many(dramaCharacter),
  locations: many(dramaLocation),
  episodes: many(dramaEpisode),
  jobs: many(dramaGenerationJob),
}));

export const dramaEpisodeRelations = relations(dramaEpisode, ({ one, many }) => ({
  project: one(dramaProject, { fields: [dramaEpisode.projectId], references: [dramaProject.id] }),
  scenes: many(dramaScene),
}));

export const dramaSceneRelations = relations(dramaScene, ({ one }) => ({
  episode: one(dramaEpisode, { fields: [dramaScene.episodeId], references: [dramaEpisode.id] }),
}));
