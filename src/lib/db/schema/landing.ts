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
    sectionKey: text("section_key").notNull().unique(),
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
