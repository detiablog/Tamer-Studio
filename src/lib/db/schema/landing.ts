import {
  pgTable,
  text,
  varchar,
  integer,
  jsonb,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const landingSection = pgTable(
  "landing_section",
  {
    id: text("id").primaryKey(),
    sectionKey: text("section_key").notNull(),
    title: text("title").notNull().default(""),
    description: text("description"),
    component: text("component").default(""),
    type: text("type").notNull().default("hero"),
    visible: boolean("visible").default(true).notNull(),
    locked: boolean("locked").default(false).notNull(),
    order: integer("order").notNull().default(0),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    styles: jsonb("styles").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("landing_section_section_key_unique").on(table.sectionKey),
    index("landing_section_section_key_idx").on(table.sectionKey),
    index("landing_section_order_idx").on(table.order),
    index("landing_section_type_idx").on(table.type),
    index("landing_section_visible_idx").on(table.visible),
    index("landing_section_locked_idx").on(table.locked),
  ]
);

export const landingMedia = pgTable(
  "landing_media",
  {
    id: text("id").primaryKey(),
    sectionKey: text("section_key").notNull().references(() => landingSection.sectionKey, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").default(""),
    type: text("type").notNull().default("image"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("landing_media_section_key_idx").on(table.sectionKey),
    index("landing_media_type_idx").on(table.type),
    index("landing_media_order_idx").on(table.order),
  ]
);

export const landingSectionRelations = relations(landingSection, ({ many }) => ({
  media: many(landingMedia),
}));

export const landingMediaRelations = relations(landingMedia, ({ one }) => ({
  section: one(landingSection, {
    fields: [landingMedia.sectionKey],
    references: [landingSection.sectionKey],
  }),
}));

export const blogPost = pgTable("blog_post", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  author: text("author"),
  coverImage: text("cover_image"),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  featured: boolean("featured").default(false).notNull(),
  readTime: integer("read_time").default(5).notNull(),
  seo: jsonb("seo").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("blog_post_slug_idx").on(table.slug),
  index("blog_post_status_idx").on(table.status),
  index("blog_post_category_idx").on(table.category),
]);

export const newsletterSubscriber = pgTable("newsletter_subscriber", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  userId: text("user_id"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("newsletter_subscriber_email_idx").on(table.email),
]);

export const landingPopup = pgTable("landing_popup", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title"),
  description: text("description"),
  content: jsonb("content").$type<Record<string, unknown>>().default({}).notNull(),
  trigger: varchar("trigger", { length: 50 }).default("immediate").notNull(),
  delay: integer("delay").default(0).notNull(),
  frequency: varchar("frequency", { length: 50 }).default("once").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("landing_popup_type_idx").on(table.type),
  index("landing_popup_active_idx").on(table.isActive),
]);

export const landingAnalytics = pgTable("landing_analytics", {
  id: text("id").primaryKey(),
  page: varchar("page", { length: 200 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventData: jsonb("event_data").$type<Record<string, unknown>>().default({}).notNull(),
  sectionKey: varchar("section_key", { length: 100 }),
  userId: text("user_id"),
  sessionId: varchar("session_id", { length: 100 }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("landing_analytics_page_idx").on(table.page),
  index("landing_analytics_type_idx").on(table.eventType),
  index("landing_analytics_created_idx").on(table.createdAt),
]);
