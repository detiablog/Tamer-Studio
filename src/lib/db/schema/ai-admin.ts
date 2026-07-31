import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const aiFeatureFlag = pgTable("ai_feature_flag", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_feature_flag_category_idx").on(table.category),
]);

export const aiRoutingRule = pgTable("ai_routing_rule", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  priority: integer("priority").default(0).notNull(),
  conditions: jsonb("conditions").$type<Record<string, unknown>>().default({}).notNull(),
  targetProvider: varchar("target_provider", { length: 100 }),
  targetModel: varchar("target_model", { length: 200 }),
  fallbackProvider: varchar("fallback_provider", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_routing_rule_active_idx").on(table.isActive),
  index("ai_routing_rule_priority_idx").on(table.priority),
]);

export const aiRuntimeSetting = pgTable("ai_runtime_setting", {
  id: text("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull(),
  description: text("description"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiSafetyPolicy = pgTable("ai_safety_policy", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  rules: jsonb("rules").$type<Record<string, unknown>>().default({}).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("ai_safety_policy_type_idx").on(table.type),
]);

export const aiAdminAction = pgTable("ai_admin_action", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: text("target_id"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ai_admin_action_admin_idx").on(table.adminId),
  index("ai_admin_action_action_idx").on(table.action),
  index("ai_admin_action_created_idx").on(table.createdAt),
]);
