import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique } from "drizzle-orm/pg-core";

export const pricingItem = pgTable("pricing_item", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  visibility: varchar("visibility", { length: 50 }).default("public").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  basePrice: text("base_price").notNull(),
  salePrice: text("sale_price"),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  features: jsonb("features").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  version: integer("version").default(1).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pricing_item_code_idx").on(table.code),
  index("pricing_item_slug_idx").on(table.slug),
  index("pricing_item_category_idx").on(table.category),
  index("pricing_item_status_idx").on(table.status),
]);

export const pricingVersion = pgTable("pricing_version", {
  id: text("id").primaryKey(),
  pricingItemId: text("pricing_item_id").notNull().references(() => pricingItem.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pricing_version_item_idx").on(table.pricingItemId),
  unique("pricing_version_item_version_unique").on(table.pricingItemId, table.version),
]);

export const pricingRegion = pgTable("pricing_region", {
  id: text("id").primaryKey(),
  pricingItemId: text("pricing_item_id").notNull().references(() => pricingItem.id, { onDelete: "cascade" }),
  country: varchar("country", { length: 10 }).notNull(),
  region: varchar("region", { length: 100 }),
  currency: varchar("currency", { length: 10 }).notNull(),
  overridePrice: text("override_price").notNull(),
  overrideSalePrice: text("override_sale_price"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("pricing_region_item_idx").on(table.pricingItemId),
  index("pricing_region_country_idx").on(table.country),
  unique("pricing_region_item_country_unique").on(table.pricingItemId, table.country),
]);

export const pricingTax = pgTable("pricing_tax", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  rate: text("rate").notNull(),
  country: varchar("country", { length: 10 }),
  region: varchar("region", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pricing_tax_country_idx").on(table.country),
]);

export const pricingFee = pgTable("pricing_fee", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  rate: text("rate").notNull(),
  minAmount: text("min_amount").default("0").notNull(),
  maxAmount: text("max_amount"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pricingItemRelations = relations(pricingItem, ({ many }) => ({
  versions: many(pricingVersion),
  regions: many(pricingRegion),
}));

export const pricingVersionRelations = relations(pricingVersion, ({ one }) => ({
  pricingItem: one(pricingItem, { fields: [pricingVersion.pricingItemId], references: [pricingItem.id] }),
}));

export const pricingRegionRelations = relations(pricingRegion, ({ one }) => ({
  pricingItem: one(pricingItem, { fields: [pricingRegion.pricingItemId], references: [pricingItem.id] }),
}));
