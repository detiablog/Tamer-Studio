import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("general").notNull(),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  thumbnail: text("thumbnail"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  language: varchar("language", { length: 10 }).default("en"),
  targetPlatforms: jsonb("target_platforms").$type<string[]>().default([]).notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  storageUsed: integer("storage_used").default(0).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("project_user_idx").on(table.userId),
  index("project_status_idx").on(table.status),
  index("project_type_idx").on(table.type),
  index("project_archived_idx").on(table.isArchived),
]);

export const projectNote = pgTable("project_note", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("project_note_project_idx").on(table.projectId),
]);

export const projectTimeline = pgTable("project_timeline", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("project_timeline_project_idx").on(table.projectId),
  index("project_timeline_type_idx").on(table.type),
]);

export const projectActivity = pgTable("project_activity", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("project_activity_project_idx").on(table.projectId),
  index("project_activity_created_idx").on(table.createdAt),
]);

export const projectTemplate = pgTable("project_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  thumbnail: text("thumbnail"),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("project_template_type_idx").on(table.type),
  index("project_template_category_idx").on(table.category),
]);

export const projectRelations = relations(project, ({ many }) => ({
  notes: many(projectNote),
  timeline: many(projectTimeline),
  activity: many(projectActivity),
}));

export const projectNoteRelations = relations(projectNote, ({ one }) => ({
  project: one(project, { fields: [projectNote.projectId], references: [project.id] }),
}));

export const projectTimelineRelations = relations(projectTimeline, ({ one }) => ({
  project: one(project, { fields: [projectTimeline.projectId], references: [project.id] }),
}));

export const projectActivityRelations = relations(projectActivity, ({ one }) => ({
  project: one(project, { fields: [projectActivity.projectId], references: [project.id] }),
}));
