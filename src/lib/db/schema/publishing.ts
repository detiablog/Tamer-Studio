import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const socialAccount = pgTable("social_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformUserId: varchar("platform_user_id", { length: 200 }).notNull(),
  username: varchar("username", { length: 200 }).notNull(),
  displayName: varchar("display_name", { length: 200 }),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  scopes: jsonb("scopes").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("social_account_user_idx").on(table.userId),
  index("social_account_platform_idx").on(table.platform),
  index("social_account_status_idx").on(table.status),
]);

export const publishPost = pgTable("publish_post", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: varchar("title", { length: 500 }),
  caption: text("caption"),
  hashtags: jsonb("hashtags").$type<string[]>().default([]).notNull(),
  mentions: jsonb("mentions").$type<string[]>().default([]).notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]).notNull(),
  mediaType: varchar("media_type", { length: 50 }).default("image").notNull(),
  link: text("link"),
  location: varchar("location", { length: 200 }),
  platformSpecific: jsonb("platform_specific").$type<Record<string, Record<string, unknown>>>().default({}).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("publish_post_user_idx").on(table.userId),
  index("publish_post_status_idx").on(table.status),
]);

export const publishJob = pgTable("publish_job", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => publishPost.id, { onDelete: "cascade" }),
  socialAccountId: text("social_account_id").notNull().references(() => socialAccount.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  platformPostId: varchar("platform_post_id", { length: 200 }),
  platformUrl: text("platform_url"),
  response: jsonb("response").$type<Record<string, unknown>>().default({}).notNull(),
  error: text("error"),
  retryCount: integer("retry_count").default(0).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("publish_job_post_idx").on(table.postId),
  index("publish_job_account_idx").on(table.socialAccountId),
  index("publish_job_status_idx").on(table.status),
  index("publish_job_scheduled_idx").on(table.scheduledAt),
]);

export const publishDraft = pgTable("publish_draft", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: varchar("title", { length: 500 }),
  caption: text("caption"),
  hashtags: jsonb("hashtags").$type<string[]>().default([]).notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>().default([]).notNull(),
  mediaType: varchar("media_type", { length: 50 }).default("image").notNull(),
  platforms: jsonb("platforms").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("publish_draft_user_idx").on(table.userId),
]);

export const publishLog = pgTable("publish_log", {
  id: text("id").primaryKey(),
  jobId: text("job_id").references(() => publishJob.id, { onDelete: "cascade" }),
  postId: text("post_id").references(() => publishPost.id, { onDelete: "set null" }),
  userId: text("user_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("publish_log_job_idx").on(table.jobId),
  index("publish_log_user_idx").on(table.userId),
  index("publish_log_created_idx").on(table.createdAt),
]);

export const socialAccountRelations = relations(socialAccount, ({ many }) => ({ jobs: many(publishJob) }));
export const publishPostRelations = relations(publishPost, ({ many }) => ({ jobs: many(publishJob) }));
export const publishJobRelations = relations(publishJob, ({ one }) => ({
  post: one(publishPost, { fields: [publishJob.postId], references: [publishPost.id] }),
  account: one(socialAccount, { fields: [publishJob.socialAccountId], references: [socialAccount.id] }),
}));
