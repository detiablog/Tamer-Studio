import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const deployment = pgTable("deployment", {
  id: text("id").primaryKey(),
  version: varchar("version", { length: 100 }).notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  commitSha: varchar("commit_sha", { length: 40 }),
  commitMessage: text("commit_message"),
  branch: varchar("branch", { length: 100 }),
  deployedBy: text("deployed_by"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("deployment_env_idx").on(table.environment),
  index("deployment_status_idx").on(table.status),
  index("deployment_created_idx").on(table.createdAt),
]);

export const deploymentBackup = pgTable("deployment_backup", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  sizeBytes: integer("size_bytes"),
  filePath: text("file_path"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("deployment_backup_type_idx").on(table.type),
  index("deployment_backup_status_idx").on(table.status),
]);

export const deploymentHealth = pgTable("deployment_health", {
  id: text("id").primaryKey(),
  serviceName: varchar("service_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("unknown").notNull(),
  uptime: text("uptime"),
  lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull(),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("deployment_health_service_idx").on(table.serviceName),
]);

export const deploymentWorker = pgTable("deployment_worker", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("stopped").notNull(),
  processId: integer("process_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  startedAt: timestamp("started_at"),
  lastHeartbeat: timestamp("last_heartbeat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("deployment_worker_status_idx").on(table.status),
]);

export const deploymentRelease = pgTable("deployment_release", {
  id: text("id").primaryKey(),
  version: varchar("version", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => [
  index("deployment_release_status_idx").on(table.status),
]);
