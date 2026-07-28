import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const localizationProfile = pgTable(
  "localization_profile",
  {
    id: text("id").primaryKey(),
    code: text("code").unique().notNull(),
    name: text("name").notNull(),
    locale: text("locale").notNull().default("en"),
    currency: text("currency").notNull().default("USD"),
    country: text("country"),
    timezone: text("timezone").notNull().default("UTC"),
    isDefault: boolean("is_default").default(false).notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    pricingProfile: text("pricing_profile").default("default"),
    paymentProfile: text("payment_profile").default("default"),
    countryCode: text("country_code"),
    supportedCurrencies: jsonb("supported_currencies").$type<string[]>().default(["USD"]),
    supportedLanguages: jsonb("supported_languages").$type<string[]>().default(["en"]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("localization_profile_code_idx").on(table.code),
    index("localization_profile_enabled_idx").on(table.isEnabled),
    index("localization_profile_default_idx").on(table.isDefault),
  ]
);

export const region = pgTable(
  "region",
  {
    id: text("id").primaryKey(),
    code: text("code").unique().notNull(),
    name: text("name").notNull(),
    nativeName: text("native_name"),
    profileCode: text("profile_code")
      .notNull()
      .references(() => localizationProfile.code, { onDelete: "restrict" }),
    enabled: boolean("enabled").default(true).notNull(),
    priority: integer("priority").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("region_code_idx").on(table.code),
    index("region_profile_idx").on(table.profileCode),
  ]
);

export const pricingProfile = pgTable(
  "pricing_profile",
  {
    id: text("id").primaryKey(),
    code: text("code").unique().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    currency: text("currency").notNull().default("USD"),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("pricing_profile_code_idx").on(table.code),
    index("pricing_profile_enabled_idx").on(table.isEnabled),
  ]
);

export const pricingRule = pgTable(
  "pricing_rule",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => pricingProfile.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    displayPrice: text("display_price").notNull(),
    amount: text("amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    billingCycle: text("billing_cycle").notNull().default("monthly"),
    isVisible: boolean("is_visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("pricing_rule_profile_idx").on(table.profileId),
    index("pricing_rule_plan_idx").on(table.planId),
    unique("pricing_rule_profile_plan_cycle_unique").on(
      table.profileId,
      table.planId,
      table.billingCycle
    ),
  ]
);

export const paymentProfile = pgTable(
  "payment_profile",
  {
    id: text("id").primaryKey(),
    code: text("code").unique().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("payment_profile_code_idx").on(table.code),
    index("payment_profile_enabled_idx").on(table.isEnabled),
  ]
);

export const paymentMethod = pgTable(
  "payment_method",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => paymentProfile.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    name: text("name").notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    priority: integer("priority").default(0).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("payment_method_profile_idx").on(table.profileId),
    unique("payment_method_profile_provider_unique").on(
      table.profileId,
      table.provider
    ),
  ]
);

export const currencyProfile = pgTable(
  "currency_profile",
  {
    id: text("id").primaryKey(),
    code: text("code").unique().notNull(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    locale: text("locale").notNull(),
    minimumFractionDigits: integer("minimum_fraction_digits").default(2).notNull(),
    maximumFractionDigits: integer("maximum_fraction_digits").default(2).notNull(),
    exchangeRateToUsd: text("exchange_rate_to_usd").default("1").notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("currency_profile_code_idx").on(table.code),
    index("currency_profile_enabled_idx").on(table.isEnabled),
  ]
);

export const localizationProfileRelations = relations(
  localizationProfile,
  ({ many }) => ({
    regions: many(region),
  })
);

export const regionRelations = relations(region, ({ one }) => ({
  profile: one(localizationProfile, {
    fields: [region.profileCode],
    references: [localizationProfile.code],
  }),
}));

export const pricingProfileRelations = relations(pricingProfile, ({ many }) => ({
  rules: many(pricingRule),
}));

export const pricingRuleRelations = relations(pricingRule, ({ one }) => ({
  profile: one(pricingProfile, {
    fields: [pricingRule.profileId],
    references: [pricingProfile.id],
  }),
}));

export const paymentProfileRelations = relations(paymentProfile, ({ many }) => ({
  methods: many(paymentMethod),
}));

export const paymentMethodRelations = relations(paymentMethod, ({ one }) => ({
  profile: one(paymentProfile, {
    fields: [paymentMethod.profileId],
    references: [paymentProfile.id],
  }),
}));
