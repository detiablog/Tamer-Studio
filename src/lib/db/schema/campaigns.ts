import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique } from "drizzle-orm/pg-core";

export const campaign = pgTable("campaign", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  banner: text("banner"),
  thumbnail: text("thumbnail"),
  priority: integer("priority").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  targetAudience: jsonb("target_audience").$type<Record<string, unknown>>().default({}).notNull(),
  visibility: varchar("visibility", { length: 50 }).default("public").notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  rules: jsonb("rules").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("campaign_code_idx").on(table.code),
  index("campaign_status_idx").on(table.status),
  index("campaign_type_idx").on(table.type),
  index("campaign_starts_idx").on(table.startsAt),
  index("campaign_ends_idx").on(table.endsAt),
]);

export const coupon = pgTable("coupon", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").references(() => campaign.id, { onDelete: "set null" }),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  value: text("value").notNull(),
  minPurchase: text("min_purchase").default("0").notNull(),
  maxDiscount: text("max_discount"),
  usageLimit: integer("usage_limit"),
  perUserLimit: integer("per_user_limit").default(1).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  applicableProducts: jsonb("applicable_products").$type<string[]>().default([]).notNull(),
  excludedProducts: jsonb("excluded_products").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("coupon_campaign_idx").on(table.campaignId),
  index("coupon_code_idx").on(table.code),
]);

export const couponRedemption = pgTable("coupon_redemption", {
  id: text("id").primaryKey(),
  couponId: text("coupon_id").notNull().references(() => coupon.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  discountAmount: text("discount_amount").default("0").notNull(),
  orderAmount: text("order_amount").default("0").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("coupon_redemption_coupon_idx").on(table.couponId),
  index("coupon_redemption_user_idx").on(table.userId),
]);

export const voucher = pgTable("voucher", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").references(() => campaign.id, { onDelete: "set null" }),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  value: text("value").notNull(),
  balance: text("balance").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  userId: text("user_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("voucher_campaign_idx").on(table.campaignId),
  index("voucher_code_idx").on(table.code),
  index("voucher_user_idx").on(table.userId),
]);

export const voucherClaim = pgTable("voucher_claim", {
  id: text("id").primaryKey(),
  voucherId: text("voucher_id").notNull().references(() => voucher.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  status: varchar("status", { length: 50 }).default("claimed").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  redeemedAt: timestamp("redeemed_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("voucher_claim_voucher_idx").on(table.voucherId),
  index("voucher_claim_user_idx").on(table.userId),
]);

export const campaignStat = pgTable("campaign_stat", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaign.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  views: integer("views").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  revenue: text("revenue").default("0").notNull(),
  couponRedemptions: integer("coupon_redemptions").default(0).notNull(),
  voucherClaims: integer("voucher_claims").default(0).notNull(),
}, (table) => [
  index("campaign_stat_campaign_idx").on(table.campaignId),
  unique("campaign_stat_campaign_date_unique").on(table.campaignId, table.date),
]);

export const campaignRelations = relations(campaign, ({ many }) => ({
  coupons: many(coupon),
  vouchers: many(voucher),
  stats: many(campaignStat),
}));

export const couponRelations = relations(coupon, ({ one, many }) => ({
  campaign: one(campaign, { fields: [coupon.campaignId], references: [campaign.id] }),
  redemptions: many(couponRedemption),
}));

export const couponRedemptionRelations = relations(couponRedemption, ({ one }) => ({
  coupon: one(coupon, { fields: [couponRedemption.couponId], references: [coupon.id] }),
}));

export const voucherRelations = relations(voucher, ({ one, many }) => ({
  campaign: one(campaign, { fields: [voucher.campaignId], references: [campaign.id] }),
  claims: many(voucherClaim),
}));

export const voucherClaimRelations = relations(voucherClaim, ({ one }) => ({
  voucher: one(voucher, { fields: [voucherClaim.voucherId], references: [voucher.id] }),
}));

export const campaignStatRelations = relations(campaignStat, ({ one }) => ({
  campaign: one(campaign, { fields: [campaignStat.campaignId], references: [campaign.id] }),
}));
