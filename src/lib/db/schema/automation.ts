import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique } from "drizzle-orm/pg-core";

export const automationRule = pgTable("automation_rule", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  priority: varchar("priority", { length: 50 }).default("normal").notNull(),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}).notNull(),
  conditions: jsonb("conditions").$type<Record<string, unknown>[]>().default([]).notNull(),
  actions: jsonb("actions").$type<Record<string, unknown>[]>().default([]).notNull(),
  scheduleConfig: jsonb("schedule_config").$type<Record<string, unknown>>().default({}).notNull(),
  retryConfig: jsonb("retry_config").$type<Record<string, unknown>>().default({}).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  executionCount: integer("execution_count").default(0).notNull(),
  successCount: integer("success_count").default(0).notNull(),
  failureCount: integer("failure_count").default(0).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastStatus: varchar("last_status", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("auto_rule_user_idx").on(table.userId),
  index("auto_rule_status_idx").on(table.status),
  index("auto_rule_enabled_idx").on(table.isEnabled),
]);

export const automationTemplate = pgTable("automation_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  type: varchar("type", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}).notNull(),
  conditions: jsonb("conditions").$type<Record<string, unknown>[]>().default([]).notNull(),
  actions: jsonb("actions").$type<Record<string, unknown>[]>().default([]).notNull(),
  scheduleConfig: jsonb("schedule_config").$type<Record<string, unknown>>().default({}).notNull(),
  retryConfig: jsonb("retry_config").$type<Record<string, unknown>>().default({}).notNull(),
  estimatedCredits: integer("estimated_credits").default(0).notNull(),
  estimatedDurationMs: integer("estimated_duration_ms").default(0).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("auto_template_type_idx").on(table.type),
  index("auto_template_category_idx").on(table.category),
]);

export const automationExecution = pgTable("automation_execution", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  ruleId: text("rule_id"),
  templateId: text("template_id"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  triggerType: varchar("trigger_type", { length: 100 }),
  triggerData: jsonb("trigger_data").$type<Record<string, unknown>>().default({}).notNull(),
  conditionsResult: jsonb("conditions_result").$type<Record<string, unknown>>().default({}).notNull(),
  actionsResult: jsonb("actions_result").$type<Record<string, unknown>>().default({}).notNull(),
  currentAction: varchar("current_action", { length: 200 }),
  completedActions: integer("completed_actions").default(0).notNull(),
  totalActions: integer("total_actions").default(0).notNull(),
  progress: integer("progress").default(0).notNull(),
  error: text("error"),
  creditsUsed: integer("credits_used").default(0).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("auto_exec_user_idx").on(table.userId),
  index("auto_exec_rule_idx").on(table.ruleId),
  index("auto_exec_status_idx").on(table.status),
]);

export const automationQueue = pgTable("automation_queue", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  executionId: text("execution_id").notNull(),
  status: varchar("status", { length: 50 }).default("waiting").notNull(),
  priority: varchar("priority", { length: 50 }).default("normal").notNull(),
  position: integer("position").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedCredits: integer("estimated_credits").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("auto_queue_user_idx").on(table.userId),
  index("auto_queue_status_idx").on(table.status),
  index("auto_queue_scheduled_idx").on(table.scheduledAt),
]);

export const automationSchedule = pgTable("automation_schedule", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  ruleId: text("rule_id"),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 100 }),
  intervalMs: integer("interval_ms"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  runCount: integer("run_count").default(0).notNull(),
  maxRuns: integer("max_runs"),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("auto_sched_user_idx").on(table.userId),
  index("auto_sched_rule_idx").on(table.ruleId),
  index("auto_sched_next_idx").on(table.nextRunAt),
]);

export const automationEvent = pgTable("automation_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }),
  entityId: text("entity_id"),
  entityType: varchar("entity_type", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processed_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("auto_event_user_idx").on(table.userId),
  index("auto_event_type_idx").on(table.eventType),
  index("auto_event_processed_idx").on(table.processed),
]);

export const automationReport = pgTable("automation_report", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  period: varchar("period", { length: 50 }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  summary: jsonb("summary").$type<Record<string, unknown>>().default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("auto_report_user_idx").on(table.userId),
  index("auto_report_type_idx").on(table.reportType),
]);

export const automationSettings = pgTable("automation_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  maxConcurrentExecutions: integer("max_concurrent_executions").default(5).notNull(),
  maxQueueSize: integer("max_queue_size").default(100).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  retryDelayMs: integer("retry_delay_ms").default(5000).notNull(),
  autoRetry: boolean("auto_retry").default(true).notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  creditWarningThreshold: integer("credit_warning_threshold").default(100).notNull(),
  defaultPriority: varchar("default_priority", { length: 50 }).default("normal").notNull(),
  allowedModules: jsonb("allowed_modules").$type<string[]>().default([]).notNull(),
  excludedModules: jsonb("excluded_modules").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("auto_settings_user_idx").on(table.userId),
  unique("auto_settings_user_unique").on(table.userId),
]);

export const automationRuleRelations = relations(automationRule, ({ many }) => ({
  executions: many(automationExecution),
  schedules: many(automationSchedule),
}));

export const automationTemplateRelations = relations(automationTemplate, ({ one }) => ({}));

export const automationExecutionRelations = relations(automationExecution, ({ one }) => ({
  rule: one(automationRule, { fields: [automationExecution.ruleId], references: [automationRule.id] }),
}));

export const automationQueueRelations = relations(automationQueue, ({ one }) => ({
  execution: one(automationExecution, { fields: [automationQueue.executionId], references: [automationExecution.id] }),
}));

export const automationScheduleRelations = relations(automationSchedule, ({ one }) => ({
  rule: one(automationRule, { fields: [automationSchedule.ruleId], references: [automationRule.id] }),
}));

export const automationEventRelations = relations(automationEvent, ({ one }) => ({}));
export const automationReportRelations = relations(automationReport, ({ one }) => ({}));
export const automationSettingsRelations = relations(automationSettings, ({ one }) => ({}));
