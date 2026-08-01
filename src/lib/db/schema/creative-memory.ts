import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique } from "drizzle-orm/pg-core";

export const creativeMemory = pgTable("creative_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  content: text("content"),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  source: varchar("source", { length: 100 }),
  score: integer("score").default(50),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_memory_user_idx").on(table.userId),
  index("creative_memory_category_idx").on(table.category),
  index("creative_memory_key_idx").on(table.key),
  index("creative_memory_score_idx").on(table.score),
]);

export const creativeBrandProfile = pgTable("creative_brand_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  logo: text("logo"),
  primaryColors: jsonb("primary_colors").$type<string[]>().default([]).notNull(),
  secondaryColors: jsonb("secondary_colors").$type<string[]>().default([]).notNull(),
  typography: varchar("typography", { length: 200 }),
  watermark: text("watermark"),
  voice: varchar("voice", { length: 100 }),
  tone: varchar("tone", { length: 100 }),
  audience: text("audience"),
  preferredCta: text("preferred_cta"),
  preferredPlatforms: jsonb("preferred_platforms").$type<string[]>().default([]).notNull(),
  keywords: jsonb("keywords").$type<string[]>().default([]).notNull(),
  rules: jsonb("rules").$type<string[]>().default([]).notNull(),
  brandStyleGuide: jsonb("brand_style_guide").$type<Record<string, unknown>>().default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_brand_user_idx").on(table.userId),
]);

export const creativePreference = pgTable("creative_preference", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  value: text("value").notNull(),
  confidence: integer("confidence").default(50).notNull(),
  source: varchar("source", { length: 100 }),
  isEditable: boolean("is_editable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_pref_user_idx").on(table.userId),
  index("creative_pref_category_idx").on(table.category),
  unique("creative_pref_user_key_unique").on(table.userId, table.key),
]);

export const creativeLearningEvent = pgTable("creative_learning_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  entityId: text("entity_id"),
  entityType: varchar("entity_type", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("creative_learning_user_idx").on(table.userId),
  index("creative_learning_type_idx").on(table.eventType),
  index("creative_learning_created_idx").on(table.createdAt),
]);

export const creativeVisualMemory = pgTable("creative_visual_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  name: varchar("name", { length: 200 }).notNull(),
  colorPalette: jsonb("color_palette").$type<string[]>().default([]).notNull(),
  composition: varchar("composition", { length: 100 }),
  lighting: varchar("lighting", { length: 100 }),
  cameraAngle: varchar("camera_angle", { length: 100 }),
  lensStyle: varchar("lens_style", { length: 100 }),
  aspectRatio: varchar("aspect_ratio", { length: 50 }),
  backgroundStyle: varchar("background_style", { length: 100 }),
  characterPosition: varchar("character_position", { length: 100 }),
  depthOfField: varchar("depth_of_field", { length: 100 }),
  mood: varchar("mood", { length: 100 }),
  contrast: varchar("contrast", { length: 100 }),
  visualIdentity: jsonb("visual_identity").$type<Record<string, unknown>>().default({}).notNull(),
  preferredModels: jsonb("preferred_models").$type<string[]>().default([]).notNull(),
  preferredResolution: varchar("preferred_resolution", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_visual_user_idx").on(table.userId),
  index("creative_visual_project_idx").on(table.projectId),
]);

export const creativeStoryMemory = pgTable("creative_story_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  storyId: text("story_id"),
  name: varchar("name", { length: 200 }).notNull(),
  storyBible: jsonb("story_bible").$type<Record<string, unknown>>().default({}).notNull(),
  universe: jsonb("universe").$type<Record<string, unknown>>().default({}).notNull(),
  timeline: jsonb("timeline").$type<Record<string, unknown>>().default({}).notNull(),
  dialogueStyle: jsonb("dialogue_style").$type<Record<string, unknown>>().default({}).notNull(),
  episodeStructure: jsonb("episode_structure").$type<Record<string, unknown>>().default({}).notNull(),
  scenePattern: jsonb("scene_pattern").$type<Record<string, unknown>>().default({}).notNull(),
  storyRules: jsonb("story_rules").$type<string[]>().default([]).notNull(),
  genrePreferences: jsonb("genre_preferences").$type<string[]>().default([]).notNull(),
  endingStyle: varchar("ending_style", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_story_user_idx").on(table.userId),
  index("creative_story_story_idx").on(table.storyId),
]);

export const creativeCharacterMemory = pgTable("creative_character_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  characterId: text("character_id"),
  name: varchar("name", { length: 200 }).notNull(),
  appearance: jsonb("appearance").$type<Record<string, unknown>>().default({}).notNull(),
  outfits: jsonb("outfits").$type<Record<string, unknown>[]>().default([]).notNull(),
  expressions: jsonb("expressions").$type<string[]>().default([]).notNull(),
  accessories: jsonb("accessories").$type<string[]>().default([]).notNull(),
  voice: varchar("voice", { length: 100 }),
  relationships: jsonb("relationships").$type<Record<string, unknown>[]>().default([]).notNull(),
  personality: jsonb("personality").$type<Record<string, unknown>>().default({}).notNull(),
  speechPattern: jsonb("speech_pattern").$type<Record<string, unknown>>().default({}).notNull(),
  visualReferences: jsonb("visual_references").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_char_user_idx").on(table.userId),
  index("creative_char_char_idx").on(table.characterId),
]);

export const creativeThumbnailMemory = pgTable("creative_thumbnail_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  name: varchar("name", { length: 200 }).notNull(),
  layout: jsonb("layout").$type<Record<string, unknown>>().default({}).notNull(),
  textPosition: varchar("text_position", { length: 100 }),
  colorStyle: varchar("color_style", { length: 100 }),
  subjectPlacement: varchar("subject_placement", { length: 100 }),
  brandElements: jsonb("brand_elements").$type<Record<string, unknown>>().default({}).notNull(),
  successfulVariants: jsonb("successful_variants").$type<Record<string, unknown>[]>().default([]).notNull(),
  ctrHistory: jsonb("ctr_history").$type<number[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_thumb_user_idx").on(table.userId),
]);

export const creativeCaptionMemory = pgTable("creative_caption_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  name: varchar("name", { length: 200 }).notNull(),
  writingStyle: varchar("writing_style", { length: 100 }),
  preferredLength: varchar("preferred_length", { length: 50 }),
  emojiUsage: varchar("emoji_usage", { length: 50 }),
  ctaStyle: varchar("cta_style", { length: 100 }),
  hashtags: jsonb("hashtags").$type<string[]>().default([]).notNull(),
  platformVariations: jsonb("platform_variations").$type<Record<string, unknown>>().default({}).notNull(),
  bestPerforming: jsonb("best_performing").$type<Record<string, unknown>[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_caption_user_idx").on(table.userId),
]);

export const creativeWorkflowMemory = pgTable("creative_workflow_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  name: varchar("name", { length: 200 }).notNull(),
  frequentlyUsed: jsonb("frequently_used").$type<Record<string, unknown>[]>().default([]).notNull(),
  favoriteTemplates: jsonb("favorite_templates").$type<string[]>().default([]).notNull(),
  automationRules: jsonb("automation_rules").$type<Record<string, unknown>[]>().default([]).notNull(),
  generationOrder: jsonb("generation_order").$type<string[]>().default([]).notNull(),
  renderingPreferences: jsonb("rendering_preferences").$type<Record<string, unknown>>().default({}).notNull(),
  publishingFlow: jsonb("publishing_flow").$type<Record<string, unknown>>().default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_workflow_user_idx").on(table.userId),
]);

export const creativeGenerationMemory = pgTable("creative_generation_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  moduleType: varchar("module_type", { length: 100 }).notNull(),
  prompt: text("prompt"),
  negativePrompt: text("negative_prompt"),
  parameters: jsonb("parameters").$type<Record<string, unknown>>().default({}).notNull(),
  result: jsonb("result").$type<Record<string, unknown>>().default({}).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  performance: jsonb("performance").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_gen_user_idx").on(table.userId),
  index("creative_gen_module_idx").on(table.moduleType),
  index("creative_gen_project_idx").on(table.projectId),
]);

export const creativePublishingMemory = pgTable("creative_publishing_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  preferredPlatforms: jsonb("preferred_platforms").$type<string[]>().default([]).notNull(),
  postingTime: jsonb("posting_time").$type<Record<string, unknown>>().default({}).notNull(),
  postingFrequency: varchar("posting_frequency", { length: 100 }),
  schedulingPattern: jsonb("scheduling_pattern").$type<Record<string, unknown>>().default({}).notNull(),
  campaignTiming: jsonb("campaign_timing").$type<Record<string, unknown>>().default({}).notNull(),
  timezone: varchar("timezone", { length: 50 }),
  publishingStrategy: jsonb("publishing_strategy").$type<Record<string, unknown>>().default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_pub_user_idx").on(table.userId),
]);

export const creativeMemorySettings = pgTable("creative_memory_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  learningEnabled: boolean("learning_enabled").default(true).notNull(),
  learningPaused: boolean("learning_paused").default(false).notNull(),
  maxMemories: integer("max_memories").default(10000),
  maxLearningEvents: integer("max_learning_events").default(5000),
  autoCleanup: boolean("auto_cleanup").default(true).notNull(),
  retentionDays: integer("retention_days").default(365),
  categoryLimits: jsonb("category_limits").$type<Record<string, number>>().default({}).notNull(),
  excludedCategories: jsonb("excluded_categories").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("creative_settings_user_idx").on(table.userId),
  unique("creative_settings_user_unique").on(table.userId),
]);

export const creativeMemoryRelations = relations(creativeMemory, ({ one }) => ({}));
export const creativeBrandProfileRelations = relations(creativeBrandProfile, ({ one }) => ({}));
export const creativePreferenceRelations = relations(creativePreference, ({ one }) => ({}));
export const creativeLearningEventRelations = relations(creativeLearningEvent, ({ one }) => ({}));
export const creativeVisualMemoryRelations = relations(creativeVisualMemory, ({ one }) => ({}));
export const creativeStoryMemoryRelations = relations(creativeStoryMemory, ({ one }) => ({}));
export const creativeCharacterMemoryRelations = relations(creativeCharacterMemory, ({ one }) => ({}));
export const creativeThumbnailMemoryRelations = relations(creativeThumbnailMemory, ({ one }) => ({}));
export const creativeCaptionMemoryRelations = relations(creativeCaptionMemory, ({ one }) => ({}));
export const creativeWorkflowMemoryRelations = relations(creativeWorkflowMemory, ({ one }) => ({}));
export const creativeGenerationMemoryRelations = relations(creativeGenerationMemory, ({ one }) => ({}));
export const creativePublishingMemoryRelations = relations(creativePublishingMemory, ({ one }) => ({}));
export const creativeMemorySettingsRelations = relations(creativeMemorySettings, ({ one }) => ({}));
