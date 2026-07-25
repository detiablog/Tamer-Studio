import {
  pgTable,
  text,
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
    key: text("key").notNull().unique(),
    type: text("type").notNull().default("hero"),
    title: text("title").notNull().default(""),
    subtitle: text("subtitle"),
    content: jsonb("content").$type<Record<string, unknown>>().default({}),
    order: integer("order").notNull().default(0),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("landing_section_key_unique").on(table.key),
    index("landing_section_key_idx").on(table.key),
    index("landing_section_order_idx").on(table.order),
    index("landing_section_type_idx").on(table.type),
    index("landing_section_visible_idx").on(table.isVisible),
  ]
);

export const landingMedia = pgTable(
  "landing_media",
  {
    id: text("id").primaryKey(),
    sectionKey: text("section_key").notNull().references(() => landingSection.key, { onDelete: "cascade" }),
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
    references: [landingSection.key],
  }),
}));
