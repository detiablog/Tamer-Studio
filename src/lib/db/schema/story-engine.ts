import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const story = pgTable("story", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  title: varchar("title", { length: 500 }).notNull(),
  genre: varchar("genre", { length: 100 }),
  theme: varchar("theme", { length: 200 }),
  synopsis: text("synopsis"),
  targetAudience: varchar("target_audience", { length: 200 }),
  tone: varchar("tone", { length: 100 }),
  narrativeStyle: varchar("narrative_style", { length: 100 }),
  language: varchar("language", { length: 10 }).default("en"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  storyRules: jsonb("story_rules").$type<string[]>().default([]).notNull(),
  keywords: jsonb("keywords").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("story_user_idx").on(table.userId),
  index("story_status_idx").on(table.status),
  index("story_genre_idx").on(table.genre),
]);

export const storyCharacter = pgTable("story_character", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => story.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  aliases: jsonb("aliases").$type<string[]>().default([]).notNull(),
  role: varchar("role", { length: 50 }).default("supporting"),
  age: integer("age"),
  occupation: varchar("occupation", { length: 200 }),
  personality: text("personality"),
  goals: text("goals"),
  motivation: text("motivation"),
  fear: text("fear"),
  weakness: text("weakness"),
  strength: text("strength"),
  speechStyle: text("speech_style"),
  appearance: text("appearance"),
  outfits: jsonb("outfits").$type<string[]>().default([]).notNull(),
  voice: text("voice"),
  background: text("background"),
  currentStatus: varchar("current_status", { length: 50 }).default("alive"),
  avatar: text("avatar"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("story_character_story_idx").on(table.storyId),
  index("story_character_role_idx").on(table.role),
]);

export const storyLocation = pgTable("story_location", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => story.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 100 }),
  description: text("description"),
  lighting: text("lighting"),
  weather: text("weather"),
  history: text("history"),
  referenceImages: jsonb("reference_images").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("story_location_story_idx").on(table.storyId),
]);

export const storyRelationship = pgTable("story_relationship", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => story.id, { onDelete: "cascade" }),
  characterAId: text("character_a_id").notNull(),
  characterBId: text("character_b_id").notNull(),
  type: varchar("type", { length: 50 }).default("friendship").notNull(),
  level: varchar("level", { length: 50 }).default("moderate"),
  description: text("description"),
  history: jsonb("history").$type<Array<{ event: string; timestamp: string }>>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("story_relationship_story_idx").on(table.storyId),
]);

export const storyEvent = pgTable("story_event", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => story.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }),
  chapter: integer("chapter"),
  scene: integer("scene"),
  characters: jsonb("characters").$type<string[]>().default([]).notNull(),
  location: varchar("location", { length: 200 }),
  emotion: varchar("emotion", { length: 50 }),
  importance: varchar("importance", { length: 50 }).default("normal"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("story_event_story_idx").on(table.storyId),
  index("story_event_type_idx").on(table.type),
]);

export const storyEpisode = pgTable("story_episode", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => story.id, { onDelete: "cascade" }),
  episodeNumber: integer("episode_number").notNull(),
  season: integer("season").default(1),
  title: varchar("title", { length: 500 }).notNull(),
  synopsis: text("synopsis"),
  summary: text("summary"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  charactersUsed: jsonb("characters_used").$type<string[]>().default([]).notNull(),
  locationsUsed: jsonb("locations_used").$type<string[]>().default([]).notNull(),
  importantEvents: jsonb("important_events").$type<string[]>().default([]).notNull(),
  emotionalState: varchar("emotional_state", { length: 100 }),
  openQuestions: jsonb("open_questions").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("story_episode_story_idx").on(table.storyId),
  index("story_episode_season_idx").on(table.season),
]);

export const storyRule = pgTable("story_rule", {
  id: text("id").primaryKey(),
  storyId: text("story_id").notNull().references(() => story.id, { onDelete: "cascade" }),
  rule: text("rule").notNull(),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("story_rule_story_idx").on(table.storyId),
]);

export const storyRelations = relations(story, ({ many }) => ({
  characters: many(storyCharacter),
  locations: many(storyLocation),
  relationships: many(storyRelationship),
  events: many(storyEvent),
  episodes: many(storyEpisode),
  rules: many(storyRule),
}));

export const storyCharacterRelations = relations(storyCharacter, ({ one }) => ({
  story: one(story, { fields: [storyCharacter.storyId], references: [story.id] }),
}));

export const storyLocationRelations = relations(storyLocation, ({ one }) => ({
  story: one(story, { fields: [storyLocation.storyId], references: [story.id] }),
}));

export const storyRelationshipRelations = relations(storyRelationship, ({ one }) => ({
  story: one(story, { fields: [storyRelationship.storyId], references: [story.id] }),
}));

export const storyEventRelations = relations(storyEvent, ({ one }) => ({
  story: one(story, { fields: [storyEvent.storyId], references: [story.id] }),
}));

export const storyEpisodeRelations = relations(storyEpisode, ({ one }) => ({
  story: one(story, { fields: [storyEpisode.storyId], references: [story.id] }),
}));

export const storyRuleRelations = relations(storyRule, ({ one }) => ({
  story: one(story, { fields: [storyRule.storyId], references: [story.id] }),
}));
