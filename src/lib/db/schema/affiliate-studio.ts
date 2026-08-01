import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const affiliateCampaign = pgTable("affiliate_campaign", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("product_review").notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  productId: text("product_id"),
  brandKitId: text("brand_kit_id"),
  strategy: jsonb("strategy").$type<Record<string, unknown>>().default({}).notNull(),
  platforms: jsonb("platforms").$type<string[]>().default([]).notNull(),
  assets: jsonb("assets").$type<Record<string, string>>().default({}).notNull(),
  scripts: jsonb("scripts").$type<Record<string, unknown>>().default({}).notNull(),
  captions: jsonb("captions").$type<Record<string, unknown>>().default({}).notNull(),
  hashtags: jsonb("hashtags").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("affiliate_campaign_user_idx").on(table.userId),
  index("affiliate_campaign_status_idx").on(table.status),
  index("affiliate_campaign_type_idx").on(table.type),
]);

export const affiliateProduct = pgTable("affiliate_product", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  brand: varchar("brand", { length: 200 }),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  url: text("url"),
  price: varchar("price", { length: 50 }),
  discount: varchar("discount", { length: 50 }),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  specifications: jsonb("specifications").$type<Record<string, string>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("affiliate_product_user_idx").on(table.userId),
  index("affiliate_product_category_idx").on(table.category),
]);

export const affiliateBrandKit = pgTable("affiliate_brand_kit", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  logo: text("logo"),
  colors: jsonb("colors").$type<Record<string, string>>().default({}).notNull(),
  tone: varchar("tone", { length: 50 }).default("friendly"),
  targetAudience: text("target_audience"),
  ctaStyle: text("cta_style"),
  watermark: text("watermark"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("affiliate_brand_kit_user_idx").on(table.userId),
]);

export const affiliateGenerationJob = pgTable("affiliate_generation_job", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => affiliateCampaign.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  input: jsonb("input").$type<Record<string, unknown>>().default({}).notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().default({}).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  error: text("error"),
  executionTimeMs: integer("execution_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("affiliate_gen_job_campaign_idx").on(table.campaignId),
  index("affiliate_gen_job_user_idx").on(table.userId),
  index("affiliate_gen_job_status_idx").on(table.status),
]);

export const affiliateCampaignRelations = relations(affiliateCampaign, ({ one, many }) => ({
  product: one(affiliateProduct, { fields: [affiliateCampaign.productId], references: [affiliateProduct.id] }),
  jobs: many(affiliateGenerationJob),
}));

export const affiliateProductRelations = relations(affiliateProduct, ({ many }) => ({
  campaigns: many(affiliateCampaign),
}));

export const affiliateGenerationJobRelations = relations(affiliateGenerationJob, ({ one }) => ({
  campaign: one(affiliateCampaign, { fields: [affiliateGenerationJob.campaignId], references: [affiliateCampaign.id] }),
}));
