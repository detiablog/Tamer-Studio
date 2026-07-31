import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const referral = pgTable("referral", {
  id: text("id").primaryKey(),
  referrerUserId: text("referrer_user_id").notNull(),
  referredUserId: text("referred_user_id"),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  rewardCredits: text("reward_credits").default("0").notNull(),
  rewardedAt: timestamp("rewarded_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("referral_referrer_idx").on(table.referrerUserId),
  index("referral_code_idx").on(table.referralCode),
  index("referral_referred_idx").on(table.referredUserId),
]);

export const affiliate = pgTable("affiliate", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  affiliateCode: varchar("affiliate_code", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  commissionRate: text("commission_rate").default("0.1").notNull(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  totalConversions: integer("total_conversions").default(0).notNull(),
  totalRevenue: text("total_revenue").default("0").notNull(),
  totalCommission: text("total_commission").default("0").notNull(),
  pendingCommission: text("pending_commission").default("0").notNull(),
  paidCommission: text("paid_commission").default("0").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("affiliate_user_idx").on(table.userId),
  index("affiliate_code_idx").on(table.affiliateCode),
]);

export const affiliateClick = pgTable("affiliate_click", {
  id: text("id").primaryKey(),
  affiliateId: text("affiliate_id").notNull().references(() => affiliate.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("affiliate_click_affiliate_idx").on(table.affiliateId),
]);

export const storageUsage = pgTable("storage_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  totalUsed: text("total_used").default("0").notNull(),
  imageCount: integer("image_count").default(0).notNull(),
  videoCount: integer("video_count").default(0).notNull(),
  documentCount: integer("document_count").default(0).notNull(),
  limitBytes: text("limit_bytes").default("1073741824").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("storage_usage_user_idx").on(table.userId),
]);

export const referralRelations = relations(referral, ({ one }) => ({
  referrer: one(affiliate, { fields: [referral.referrerUserId], references: [affiliate.userId] }),
}));

export const affiliateRelations = relations(affiliate, ({ many }) => ({
  clicks: many(affiliateClick),
}));

export const affiliateClickRelations = relations(affiliateClick, ({ one }) => ({
  affiliate: one(affiliate, { fields: [affiliateClick.affiliateId], references: [affiliate.id] }),
}));
