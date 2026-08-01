import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real, unique } from "drizzle-orm/pg-core";

export const assetMetadata = pgTable("asset_metadata", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  assetType: varchar("asset_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  aspectRatio: varchar("aspect_ratio", { length: 50 }),
  fileSize: integer("file_size"),
  format: varchar("format", { length: 50 }),
  language: varchar("language", { length: 10 }),
  dominantColors: jsonb("dominant_colors").$type<string[]>().default([]).notNull(),
  colorPalette: jsonb("color_palette").$type<string[]>().default([]).notNull(),
  projectId: text("project_id"),
  promptReference: text("prompt_reference"),
  workflowReference: text("workflow_reference"),
  publishingReference: text("publishing_reference"),
  aiModel: varchar("ai_model", { length: 200 }),
  provider: varchar("provider", { length: 100 }),
  generationMetadata: jsonb("generation_metadata").$type<Record<string, unknown>>().default({}).notNull(),
  extractionStatus: varchar("extraction_status", { length: 50 }).default("pending").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("asset_meta_user_idx").on(table.userId),
  index("asset_meta_asset_idx").on(table.assetId),
  index("asset_meta_type_idx").on(table.assetType),
  index("asset_meta_project_idx").on(table.projectId),
  index("asset_meta_extraction_idx").on(table.extractionStatus),
]);

export const assetTag = pgTable("asset_tag", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  isSystem: boolean("is_system").default(false).notNull(),
  useCount: integer("use_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_tag_user_idx").on(table.userId),
  index("asset_tag_name_idx").on(table.name),
  unique("asset_tag_user_name_unique").on(table.userId, table.name),
]);

export const assetTagAssignment = pgTable("asset_tag_assignment", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  tagId: text("tag_id").notNull(),
  isAuto: boolean("is_auto").default(true).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_tag_assign_user_idx").on(table.userId),
  index("asset_tag_assign_asset_idx").on(table.assetId),
  index("asset_tag_assign_tag_idx").on(table.tagId),
  unique("asset_tag_assign_unique").on(table.assetId, table.tagId),
]);

export const assetCategory = pgTable("asset_category", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  parent: varchar("parent", { length: 200 }),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("asset_cat_user_idx").on(table.userId),
  index("asset_cat_type_idx").on(table.type),
]);

export const assetClassification = pgTable("asset_classification", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  projectId: text("project_id"),
  campaign: varchar("campaign", { length: 200 }),
  story: varchar("story", { length: 200 }),
  character: varchar("character", { length: 200 }),
  brand: varchar("brand", { length: 200 }),
  platform: varchar("platform", { length: 100 }),
  contentType: varchar("content_type", { length: 100 }),
  mediaType: varchar("media_type", { length: 100 }),
  style: varchar("style", { length: 100 }),
  theme: varchar("theme", { length: 100 }),
  genre: varchar("genre", { length: 100 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  confidence: integer("confidence").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("asset_class_user_idx").on(table.userId),
  index("asset_class_asset_idx").on(table.assetId),
  index("asset_class_project_idx").on(table.projectId),
  index("asset_class_character_idx").on(table.character),
  index("asset_class_brand_idx").on(table.brand),
]);

export const assetRecognition = pgTable("asset_recognition", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  recognitionType: varchar("recognition_type", { length: 100 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  confidence: integer("confidence").default(0).notNull(),
  boundingBox: jsonb("bounding_box").$type<Record<string, number>>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_recog_user_idx").on(table.userId),
  index("asset_recog_asset_idx").on(table.assetId),
  index("asset_recog_type_idx").on(table.recognitionType),
]);

export const assetDuplicate = pgTable("asset_duplicate", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  duplicateAssetId: text("duplicate_asset_id").notNull(),
  matchType: varchar("match_type", { length: 100 }).notNull(),
  similarityScore: integer("similarity_score").notNull(),
  status: varchar("status", { length: 50 }).default("detected").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_dup_user_idx").on(table.userId),
  index("asset_dup_asset_idx").on(table.assetId),
  index("asset_dup_dup_idx").on(table.duplicateAssetId),
  index("asset_dup_status_idx").on(table.status),
]);

export const assetRelationship = pgTable("asset_relationship", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  sourceAssetId: text("source_asset_id").notNull(),
  targetAssetId: text("target_asset_id").notNull(),
  relationshipType: varchar("relationship_type", { length: 100 }).notNull(),
  strength: integer("strength").default(50).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_rel_user_idx").on(table.userId),
  index("asset_rel_source_idx").on(table.sourceAssetId),
  index("asset_rel_target_idx").on(table.targetAssetId),
  index("asset_rel_type_idx").on(table.relationshipType),
  unique("asset_rel_unique").on(table.sourceAssetId, table.targetAssetId, table.relationshipType),
]);

export const assetQualityScore = pgTable("asset_quality_score", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  resolution: integer("resolution").default(0).notNull(),
  sharpness: integer("sharpness").default(0).notNull(),
  composition: integer("composition").default(0).notNull(),
  lighting: integer("lighting").default(0).notNull(),
  brandConsistency: integer("brand_consistency").default(0).notNull(),
  technicalQuality: integer("technical_quality").default(0).notNull(),
  overallScore: integer("overall_score").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_quality_user_idx").on(table.userId),
  index("asset_quality_asset_idx").on(table.assetId),
  index("asset_quality_score_idx").on(table.overallScore),
]);

export const assetCollection = pgTable("asset_collection", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).default("manual").notNull(),
  color: varchar("color", { length: 50 }),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isAuto: boolean("is_auto").default(false).notNull(),
  rules: jsonb("rules").$type<Record<string, unknown>>().default({}).notNull(),
  assetCount: integer("asset_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("asset_coll_user_idx").on(table.userId),
  index("asset_coll_type_idx").on(table.type),
]);

export const assetCollectionItem = pgTable("asset_collection_item", {
  id: text("id").primaryKey(),
  collectionId: text("collection_id").notNull(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  position: integer("position").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("asset_coll_item_coll_idx").on(table.collectionId),
  index("asset_coll_item_asset_idx").on(table.assetId),
  unique("asset_coll_item_unique").on(table.collectionId, table.assetId),
]);

export const assetSearchIndex = pgTable("asset_search_index", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assetId: text("asset_id").notNull(),
  searchText: text("search_text").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  categories: jsonb("categories").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("asset_search_user_idx").on(table.userId),
  index("asset_search_asset_idx").on(table.assetId),
  index("asset_search_text_idx").on(table.searchText),
]);

export const assetSettings = pgTable("asset_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  autoTagging: boolean("auto_tagging").default(true).notNull(),
  autoClassification: boolean("auto_classification").default(true).notNull(),
  duplicateDetection: boolean("duplicate_detection").default(true).notNull(),
  qualityScoring: boolean("quality_scoring").default(true).notNull(),
  autoRelationships: boolean("auto_relationships").default(true).notNull(),
  autoIndexing: boolean("auto_indexing").default(true).notNull(),
  minQualityScore: integer("min_quality_score").default(50).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const assetMetadataRelations = relations(assetMetadata, ({ many }) => ({
  tags: many(assetTagAssignment),
  classifications: many(assetClassification),
  recognitions: many(assetRecognition),
}));

export const assetTagRelations = relations(assetTag, ({ many }) => ({
  assignments: many(assetTagAssignment),
}));

export const assetTagAssignmentRelations = relations(assetTagAssignment, ({ one }) => ({
  tag: one(assetTag, { fields: [assetTagAssignment.tagId], references: [assetTag.id] }),
}));

export const assetCategoryRelations = relations(assetCategory, ({ one }) => ({}));
export const assetClassificationRelations = relations(assetClassification, ({ one }) => ({}));
export const assetRecognitionRelations = relations(assetRecognition, ({ one }) => ({}));
export const assetDuplicateRelations = relations(assetDuplicate, ({ one }) => ({}));
export const assetRelationshipRelations = relations(assetRelationship, ({ one }) => ({}));
export const assetQualityScoreRelations = relations(assetQualityScore, ({ one }) => ({}));
export const assetCollectionRelations = relations(assetCollection, ({ many }) => ({
  items: many(assetCollectionItem),
}));
export const assetCollectionItemRelations = relations(assetCollectionItem, ({ one }) => ({
  collection: one(assetCollection, { fields: [assetCollectionItem.collectionId], references: [assetCollection.id] }),
}));
export const assetSearchIndexRelations = relations(assetSearchIndex, ({ one }) => ({}));
export const assetSettingsRelations = relations(assetSettings, ({ one }) => ({}));
