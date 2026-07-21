import { pgTable, text, timestamp, jsonb, boolean, integer, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const notificationTemplate = pgTable(
  "notification_template",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    channel: text("channel").notNull(),
    subject: text("subject"),
    body: text("body").notNull(),
    variables: jsonb("variables").$type<Record<string, unknown>[]>().default([]),
    locale: text("locale").default("en").notNull(),
    version: integer("version").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("notification_template_category_idx").on(table.category),
    index("notification_template_channel_idx").on(table.channel),
  ]
);

export const notificationTemplateVersion = pgTable(
  "notification_template_version",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => notificationTemplate.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    subject: text("subject"),
    body: text("body").notNull(),
    variables: jsonb("variables").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_template_version_template_idx").on(table.templateId),
  ]
);

export const notificationPreference = pgTable(
  "notification_preference",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    category: text("category").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("notification_preference_unique").on(table.userId, table.channel, table.category),
    index("notification_preference_user_id_idx").on(table.userId),
  ]
);

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    category: text("category").notNull(),
    channel: text("channel").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().default({}),
    priority: text("priority").default("normal").notNull(),
    status: text("status").default("pending").notNull(),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    readAt: timestamp("read_at"),
    archivedAt: timestamp("archived_at"),
    deletedAt: timestamp("deleted_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_status_idx").on(table.status),
    index("notification_category_idx").on(table.category),
    index("notification_created_at_idx").on(table.createdAt),
  ]
);

export const eventQueue = pgTable(
  "event_queue",
  {
    id: text("id").primaryKey(),
    eventType: text("event_type").notNull(),
    eventData: jsonb("event_data").$type<Record<string, unknown>>().notNull(),
    priority: integer("priority").default(0).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    nextAttemptAt: timestamp("next_attempt_at"),
    lastError: text("last_error"),
    status: text("status").default("pending").notNull(),
    processedAt: timestamp("processed_at"),
    failedAt: timestamp("failed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_queue_status_idx").on(table.status),
    index("event_queue_next_attempt_idx").on(table.nextAttemptAt),
    index("event_queue_event_type_idx").on(table.eventType),
  ]
);

export const notificationPreferenceRelations = relations(notificationPreference, ({ one }) => ({
  user: one(user, {
    fields: [notificationPreference.userId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
