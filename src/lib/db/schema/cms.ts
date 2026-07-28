import {
  pgTable,
  text,
  integer,
  jsonb,
  boolean,
  timestamp,
  index,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cmsPage = pgTable(
  "cms_page",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull().default(""),
    slug: text("slug").notNull().default(""),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    contentType: varchar("content_type", { length: 20 }).notNull().default("page"),
    parentId: text("parent_id"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoOgImage: text("seo_og_image"),
    seoCanonical: text("seo_canonical"),
    seoRobots: text("seo_robots"),
    localizationLocale: varchar("localization_locale", { length: 10 }).notNull().default("en"),
    localizationFallbackLocale: varchar("localization_fallback_locale", { length: 10 }).notNull().default("en"),
    localizationTranslations: jsonb("localization_translations").$type<Record<string, Record<string, string>>>().default({}),
    permissionsRead: jsonb("permissions_read").$type<string[]>().default(["admin", "editor", "author", "viewer"]),
    permissionsWrite: jsonb("permissions_write").$type<string[]>().default(["admin", "editor"]),
    permissionsPublish: jsonb("permissions_publish").$type<string[]>().default(["admin"]),
    version: integer("version").notNull().default(1),
    publishedVersion: integer("published_version"),
    scheduledAt: timestamp("scheduled_at"),
    publishedAt: timestamp("published_at"),
    authorId: text("author_id").notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("cms_page_slug_unique").on(table.slug),
    index("cms_page_slug_idx").on(table.slug),
    index("cms_page_status_idx").on(table.status),
    index("cms_page_content_type_idx").on(table.contentType),
    index("cms_page_parent_id_idx").on(table.parentId),
    index("cms_page_author_id_idx").on(table.authorId),
  ]
);

export const cmsSection = pgTable(
  "cms_section",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id").notNull().references(() => cmsPage.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").notNull().default(""),
    type: text("type").notNull().default("hero"),
    title: text("title").notNull().default(""),
    description: text("description"),
    component: text("component").default(""),
    order: integer("order").notNull().default(0),
    visible: boolean("visible").default(true).notNull(),
    locked: boolean("locked").default(false).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    styles: jsonb("styles").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("cms_section_page_id_idx").on(table.pageId),
    unique("cms_section_section_key_unique").on(table.sectionKey),
    index("cms_section_section_key_idx").on(table.sectionKey),
    index("cms_section_order_idx").on(table.order),
    index("cms_section_type_idx").on(table.type),
    index("cms_section_visible_idx").on(table.visible),
  ]
);

export const cmsBlock = pgTable(
  "cms_block",
  {
    id: text("id").primaryKey(),
    sectionId: text("section_id").notNull().references(() => cmsSection.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("text"),
    properties: jsonb("properties").$type<Record<string, unknown>>().default({}),
    order: integer("order").notNull().default(0),
    visible: boolean("visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("cms_block_section_id_idx").on(table.sectionId),
    index("cms_block_order_idx").on(table.order),
  ]
);

export const cmsComponent = pgTable(
  "cms_component",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().default(""),
    type: text("type").notNull().default("custom"),
    schema: jsonb("schema").$type<Record<string, unknown>>().default({}),
    preview: text("preview"),
    localization: boolean("localization").default(true).notNull(),
    permissions: jsonb("permissions").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("cms_component_type_idx").on(table.type),
  ]
);

export const cmsMedia = pgTable(
  "cms_media",
  {
    id: text("id").primaryKey(),
    filename: text("filename").notNull().default(""),
    url: text("url").notNull().default(""),
    alt: text("alt"),
    type: text("type").notNull().default("image"),
    size: integer("size").notNull().default(0),
    folder: text("folder"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("cms_media_type_idx").on(table.type),
    index("cms_media_folder_idx").on(table.folder),
  ]
);

export const cmsVersion = pgTable(
  "cms_version",
  {
    id: text("id").primaryKey(),
    contentId: text("content_id").notNull(),
    contentType: varchar("content_type", { length: 20 }).notNull().default("page"),
    version: integer("version").notNull().default(1),
    data: jsonb("data").$type<Record<string, unknown>>().default({}),
    authorId: text("author_id").notNull(),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("cms_version_content_id_idx").on(table.contentId),
    index("cms_version_content_type_idx").on(table.contentType),
    index("cms_version_created_at_idx").on(table.createdAt),
  ]
);

export const cmsPublishPipeline = pgTable(
  "cms_publish_pipeline",
  {
    id: text("id").primaryKey(),
    contentId: text("content_id").notNull(),
    contentType: varchar("content_type", { length: 20 }).notNull().default("page"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("cms_publish_pipeline_content_id_idx").on(table.contentId),
    index("cms_publish_pipeline_status_idx").on(table.status),
  ]
);

export const cmsPublishStep = pgTable(
  "cms_publish_step",
  {
    id: text("id").primaryKey(),
    pipelineId: text("pipeline_id").notNull().references(() => cmsPublishPipeline.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    error: text("error"),
  },
  (table) => [
    index("cms_publish_step_pipeline_id_idx").on(table.pipelineId),
    index("cms_publish_step_status_idx").on(table.status),
  ]
);

export const cmsAuditEntry = pgTable(
  "cms_audit_entry",
  {
    id: text("id").primaryKey(),
    action: varchar("action", { length: 20 }).notNull().default("edit"),
    contentType: varchar("content_type", { length: 20 }).notNull().default("page"),
    contentId: text("content_id").notNull(),
    authorId: text("author_id").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    index("cms_audit_entry_content_id_idx").on(table.contentId),
    index("cms_audit_entry_content_type_idx").on(table.contentType),
    index("cms_audit_entry_timestamp_idx").on(table.timestamp),
    index("cms_audit_entry_author_id_idx").on(table.authorId),
  ]
);

export const cmsPageRelations = relations(cmsPage, ({ many }) => ({
  sections: many(cmsSection),
}));

export const cmsSectionRelations = relations(cmsSection, ({ one, many }) => ({
  page: one(cmsPage, {
    fields: [cmsSection.pageId],
    references: [cmsPage.id],
  }),
  blocks: many(cmsBlock),
}));

export const cmsBlockRelations = relations(cmsBlock, ({ one }) => ({
  section: one(cmsSection, {
    fields: [cmsBlock.sectionId],
    references: [cmsSection.id],
  }),
}));

export const cmsPublishPipelineRelations = relations(cmsPublishPipeline, ({ many }) => ({
  steps: many(cmsPublishStep),
}));

export const cmsPublishStepRelations = relations(cmsPublishStep, ({ one }) => ({
  pipeline: one(cmsPublishPipeline, {
    fields: [cmsPublishStep.pipelineId],
    references: [cmsPublishPipeline.id],
  }),
}));
