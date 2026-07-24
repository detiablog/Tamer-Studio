import { pgTable, text, timestamp, jsonb, index, unique, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const featureFlag = pgTable(
  "feature_flag",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    description: text("description").notNull().default(""),
    enabled: boolean("enabled").notNull().default(false),
    scope: text("scope").notNull().default("global"),
    targetId: text("target_id"),
    rolloutPercentage: integer("rollout_percentage"),
    scheduledAt: timestamp("scheduled_at"),
    expiresAt: timestamp("expires_at"),
    createdBy: text("created_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("feature_flag_key_unique").on(table.key),
    index("feature_flag_key_idx").on(table.key),
    index("feature_flag_scope_idx").on(table.scope),
    index("feature_flag_enabled_idx").on(table.enabled),
  ]
);

export const featureFlagHistory = pgTable(
  "feature_flag_history",
  {
    id: text("id").primaryKey(),
    flagId: text("flag_id").notNull().references(() => featureFlag.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    previousValue: jsonb("previous_value").$type<Record<string, unknown>>().notNull().default({}),
    newValue: jsonb("new_value").$type<Record<string, unknown>>().notNull().default({}),
    changedBy: text("changed_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("feature_flag_history_flag_idx").on(table.flagId),
    index("feature_flag_history_created_at_idx").on(table.createdAt),
  ]
);

export const featureFlagRelations = relations(featureFlag, ({ many }) => ({
  history: many(featureFlagHistory),
}));

export const featureFlagHistoryRelations = relations(featureFlagHistory, ({ one }) => ({
  flag: one(featureFlag, {
    fields: [featureFlagHistory.flagId],
    references: [featureFlag.id],
  }),
}));
