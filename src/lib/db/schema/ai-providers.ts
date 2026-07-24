import { pgTable, text, timestamp, jsonb, index, unique, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const aiProvider = pgTable(
  "ai_provider",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    providerType: text("provider_type").notNull(),
    status: text("status").notNull().default("active"),
    priority: integer("priority").notNull().default(0),
    enabled: boolean("enabled").notNull().default(true),
    apiKeyConfigured: boolean("api_key_configured").notNull().default(false),
    capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]),
    models: jsonb("models").$type<string[]>().notNull().default([]),
    rateLimit: jsonb("rate_limit").$type<{ requestsPerMinute: number; tokensPerMinute: number }>(),
    costConfiguration: jsonb("cost_configuration").$type<Record<string, unknown>>(),
    config: jsonb("config").$type<Record<string, unknown>>(),
    health: jsonb("health").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("ai_provider_name_unique").on(table.name),
    index("ai_provider_name_idx").on(table.name),
    index("ai_provider_status_idx").on(table.status),
    index("ai_provider_enabled_idx").on(table.enabled),
  ]
);

export const aiProviderModel = pgTable(
  "ai_provider_model",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id").notNull().references(() => aiProvider.id, { onDelete: "cascade" }),
    modelId: text("model_id").notNull(),
    capability: text("capability").notNull(),
    available: boolean("available").notNull().default(true),
    deprecated: boolean("deprecated").notNull().default(false),
    deprecationDate: timestamp("deprecation_date"),
    replacementModel: text("replacement_model"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("ai_provider_model_unique").on(table.providerId, table.modelId),
    index("ai_provider_model_provider_idx").on(table.providerId),
    index("ai_provider_model_model_idx").on(table.modelId),
  ]
);

export const aiProviderRelations = relations(aiProvider, ({ many }) => ({
  models: many(aiProviderModel),
}));

export const aiProviderModelRelations = relations(aiProviderModel, ({ one }) => ({
  provider: one(aiProvider, {
    fields: [aiProviderModel.providerId],
    references: [aiProvider.id],
  }),
}));
