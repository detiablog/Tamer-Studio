import { pgTable, text, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const asset = pgTable(
  "asset",
  {
    assetId: text("asset_id").primaryKey(),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("draft"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    sourceExecutionId: text("source_execution_id"),
    sourceWorkflowId: text("source_workflow_id"),
    sourceGatewayId: text("source_gateway_id"),
    sourcePromptId: text("source_prompt_id"),
    sourceCapabilityId: text("source_capability_id"),
    currentVersion: text("current_version").notNull().default("1.0.0"),
    storageRef: jsonb("storage_ref").$type<Record<string, unknown>>().notNull().default({}),
    preview: jsonb("preview").$type<Record<string, unknown>>().notNull().default({}),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("asset_kind_idx").on(table.kind),
    index("asset_status_idx").on(table.status),
    index("asset_created_by_idx").on(table.createdBy),
    index("asset_source_execution_idx").on(table.sourceExecutionId),
    index("asset_source_workflow_idx").on(table.sourceWorkflowId),
    unique("asset_version_unique").on(table.assetId, table.currentVersion),
  ]
);

export const assetVersion = pgTable(
  "asset_version",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id").notNull().references(() => asset.assetId, { onDelete: "cascade" }),
    version: text("version").notNull(),
    changelog: text("changelog"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    storageRef: jsonb("storage_ref").$type<Record<string, unknown>>().notNull().default({}),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("asset_version_asset_id_idx").on(table.assetId)]
);

export const assetLineage = pgTable(
  "asset_lineage",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id").notNull().references(() => asset.assetId, { onDelete: "cascade" }),
    parentId: text("parent_id").notNull().references(() => asset.assetId, { onDelete: "cascade" }),
    relationship: text("relationship").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("asset_lineage_asset_id_idx").on(table.assetId), index("asset_lineage_parent_id_idx").on(table.parentId)]
);

export const assetCollection = pgTable(
  "asset_collection",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    visibility: text("visibility").notNull().default("private"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("asset_collection_created_by_idx").on(table.createdBy)]
);

export const assetCollectionItem = pgTable(
  "asset_collection_item",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").notNull().references(() => assetCollection.id, { onDelete: "cascade" }),
    assetId: text("asset_id").notNull().references(() => asset.assetId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("asset_collection_item_collection_id_idx").on(table.collectionId),
    index("asset_collection_item_asset_id_idx").on(table.assetId),
    unique("asset_collection_unique").on(table.collectionId, table.assetId),
  ]
);

export const assetTag = pgTable(
  "asset_tag",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id").notNull().references(() => asset.assetId, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("asset_tag_asset_id_idx").on(table.assetId), index("asset_tag_tag_idx").on(table.tag)]
);

export const assetLifecycleEvent = pgTable(
  "asset_lifecycle_event",
  {
    id: text("id").primaryKey(),
    assetId: text("asset_id").notNull().references(() => asset.assetId, { onDelete: "cascade" }),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    trigger: text("trigger").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("asset_lifecycle_asset_id_idx").on(table.assetId)]
);

export const assetRelations = relations(asset, ({ many }) => ({
  versions: many(assetVersion),
  lineage: many(assetLineage, { relationName: "assetLineage" }),
  collections: many(assetCollectionItem),
  tags: many(assetTag),
  lifecycleEvents: many(assetLifecycleEvent),
}));

export const assetVersionRelations = relations(assetVersion, ({ one }) => ({
  asset: one(asset, {
    fields: [assetVersion.assetId],
    references: [asset.assetId],
  }),
}));

export const assetLineageRelations = relations(assetLineage, ({ one }) => ({
  asset: one(asset, {
    fields: [assetLineage.assetId],
    references: [asset.assetId],
    relationName: "assetLineage",
  }),
  parent: one(asset, {
    fields: [assetLineage.parentId],
    references: [asset.assetId],
  }),
}));

export const assetCollectionRelations = relations(assetCollection, ({ one, many }) => ({
  creator: one(asset, { fields: [assetCollection.createdBy], references: [asset.assetId] }),
  items: many(assetCollectionItem),
}));

export const assetCollectionItemRelations = relations(assetCollectionItem, ({ one }) => ({
  collection: one(assetCollection, {
    fields: [assetCollectionItem.collectionId],
    references: [assetCollection.id],
  }),
  asset: one(asset, {
    fields: [assetCollectionItem.assetId],
    references: [asset.assetId],
  }),
}));

export const assetTagRelations = relations(assetTag, ({ one }) => ({
  asset: one(asset, {
    fields: [assetTag.assetId],
    references: [asset.assetId],
  }),
}));

export const assetLifecycleRelations = relations(assetLifecycleEvent, ({ one }) => ({
  asset: one(asset, {
    fields: [assetLifecycleEvent.assetId],
    references: [asset.assetId],
  }),
}));
