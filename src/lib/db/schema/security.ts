import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const securityEvent = pgTable("security_event", {
  id: text("id").primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("info").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  userId: text("user_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("security_event_type_idx").on(table.eventType),
  index("security_event_severity_idx").on(table.severity),
  index("security_event_user_idx").on(table.userId),
  index("security_event_created_idx").on(table.createdAt),
]);

export const securityIncident = pgTable("security_incident", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  affectedUsers: integer("affected_users").default(0).notNull(),
  affectedServices: jsonb("affected_services").$type<string[]>().default([]).notNull(),
  timeline: jsonb("timeline").$type<Array<{ timestamp: string; action: string; note: string; admin: string }>>().default([]).notNull(),
  resolution: text("resolution"),
  assignedTo: text("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("security_incident_status_idx").on(table.status),
  index("security_incident_severity_idx").on(table.severity),
]);

export const securityRateLimit = pgTable("security_rate_limit", {
  id: text("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  maxRequests: integer("max_requests").notNull(),
  windowMs: integer("window_ms").notNull(),
  currentCount: integer("current_count").default(0).notNull(),
  windowStart: timestamp("window_start").defaultNow().notNull(),
  blockedUntil: timestamp("blocked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("security_rate_limit_key_idx").on(table.key),
]);

export const securityAuditLog = pgTable("security_audit_log", {
  id: text("id").primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: text("entity_id"),
  userId: text("user_id"),
  changes: jsonb("changes").$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("security_audit_action_idx").on(table.action),
  index("security_audit_entity_idx").on(table.entityType),
  index("security_audit_user_idx").on(table.userId),
  index("security_audit_created_idx").on(table.createdAt),
]);
