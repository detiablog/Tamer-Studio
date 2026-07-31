import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const storageFile = pgTable("storage_file", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  originalName: varchar("original_name", { length: 500 }).notNull(),
  mimeType: varchar("mime_type", { length: 200 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  checksum: varchar("checksum", { length: 64 }),
  provider: varchar("provider", { length: 50 }).default("local").notNull(),
  status: varchar("status", { length: 50 }).default("ready").notNull(),
  kind: varchar("kind", { length: 50 }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  thumbnailKey: text("thumbnail_key"),
  previewKey: text("preview_key"),
  folderId: text("folder_id"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  expiresAt: timestamp("expires_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("storage_file_user_idx").on(table.userId),
  index("storage_file_provider_idx").on(table.provider),
  index("storage_file_kind_idx").on(table.kind),
  index("storage_file_status_idx").on(table.status),
  index("storage_file_folder_idx").on(table.folderId),
]);

export const storageFolder = pgTable("storage_folder", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  parentId: text("parent_id"),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("storage_folder_user_idx").on(table.userId),
  index("storage_folder_parent_idx").on(table.parentId),
]);

export const storageQuota = pgTable("storage_quota", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  totalBytes: text("total_bytes").default("1073741824").notNull(),
  usedBytes: text("used_bytes").default("0").notNull(),
  imageBytes: text("image_bytes").default("0").notNull(),
  videoBytes: text("video_bytes").default("0").notNull(),
  documentBytes: text("document_bytes").default("0").notNull(),
  fileCount: integer("file_count").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("storage_quota_user_idx").on(table.userId),
]);

export const storageProviderHealth = pgTable("storage_provider_health", {
  id: text("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("unknown").notNull(),
  latencyMs: integer("latency_ms"),
  lastCheckedAt: timestamp("last_checked_at"),
  lastError: text("last_error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("storage_provider_health_provider_idx").on(table.provider),
]);

export const storageFileRelations = relations(storageFile, ({ one }) => ({
  folder: one(storageFolder, { fields: [storageFile.folderId], references: [storageFolder.id] }),
}));

export const storageFolderRelations = relations(storageFolder, ({ one }) => ({
  parent: one(storageFolder, { fields: [storageFolder.parentId], references: [storageFolder.id] }),
}));
