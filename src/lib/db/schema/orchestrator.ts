import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, unique } from "drizzle-orm/pg-core";

export const orchestratorPipeline = pgTable("orchestrator_pipeline", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  triggerType: varchar("trigger_type", { length: 50 }),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_pipeline_user_idx").on(table.userId),
  index("orch_pipeline_type_idx").on(table.type),
  index("orch_pipeline_status_idx").on(table.status),
]);

export const orchestratorPipelineStep = pgTable("orchestrator_pipeline_step", {
  id: text("id").primaryKey(),
  pipelineId: text("pipeline_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  moduleType: varchar("module_type", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  order: integer("order").notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  inputMapping: jsonb("input_mapping").$type<Record<string, string>>().default({}).notNull(),
  outputKey: varchar("output_key", { length: 100 }),
  conditions: jsonb("conditions").$type<Record<string, unknown>>().default({}).notNull(),
  retryConfig: jsonb("retry_config").$type<Record<string, unknown>>().default({}).notNull(),
  timeoutMs: integer("timeout_ms"),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_step_pipeline_idx").on(table.pipelineId),
  index("orch_step_order_idx").on(table.order),
]);

export const orchestratorExecution = pgTable("orchestrator_execution", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  pipelineId: text("pipeline_id").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  triggerType: varchar("trigger_type", { length: 50 }),
  input: jsonb("input").$type<Record<string, unknown>>().default({}).notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().default({}).notNull(),
  error: text("error"),
  progress: integer("progress").default(0).notNull(),
  currentStep: varchar("current_step", { length: 200 }),
  completedSteps: integer("completed_steps").default(0).notNull(),
  totalSteps: integer("total_steps").default(0).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  storageUsed: integer("storage_used").default(0).notNull(),
  estimatedCredits: integer("estimated_credits").default(0).notNull(),
  estimatedDurationMs: integer("estimated_duration_ms").default(0).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_exec_user_idx").on(table.userId),
  index("orch_exec_pipeline_idx").on(table.pipelineId),
  index("orch_exec_status_idx").on(table.status),
]);

export const orchestratorTask = pgTable("orchestrator_task", {
  id: text("id").primaryKey(),
  executionId: text("execution_id").notNull(),
  stepId: text("step_id"),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  moduleType: varchar("module_type", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  priority: varchar("priority", { length: 50 }).default("normal").notNull(),
  input: jsonb("input").$type<Record<string, unknown>>().default({}).notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().default({}).notNull(),
  error: text("error"),
  progress: integer("progress").default(0).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  scheduledAt: timestamp("scheduled_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_task_exec_idx").on(table.executionId),
  index("orch_task_user_idx").on(table.userId),
  index("orch_task_status_idx").on(table.status),
  index("orch_task_priority_idx").on(table.priority),
]);

export const orchestratorQueue = pgTable("orchestrator_queue", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  taskId: text("task_id").notNull(),
  status: varchar("status", { length: 50 }).default("waiting").notNull(),
  priority: varchar("priority", { length: 50 }).default("normal").notNull(),
  position: integer("position").notNull(),
  estimatedCredits: integer("estimated_credits").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_queue_user_idx").on(table.userId),
  index("orch_queue_status_idx").on(table.status),
  index("orch_queue_priority_idx").on(table.priority),
  index("orch_queue_position_idx").on(table.position),
]);

export const orchestratorTemplate = pgTable("orchestrator_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  icon: varchar("icon", { length: 100 }),
  pipelineConfig: jsonb("pipeline_config").$type<Record<string, unknown>>().default({}).notNull(),
  steps: jsonb("steps").$type<Record<string, unknown>[]>().default([]).notNull(),
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
  index("orch_template_type_idx").on(table.type),
  index("orch_template_category_idx").on(table.category),
]);

export const orchestratorRule = pgTable("orchestrator_rule", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  triggerType: varchar("trigger_type", { length: 100 }).notNull(),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}).notNull(),
  conditions: jsonb("conditions").$type<Record<string, unknown>[]>().default([]).notNull(),
  actions: jsonb("actions").$type<Record<string, unknown>[]>().default([]).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  executionCount: integer("execution_count").default(0).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_rule_user_idx").on(table.userId),
  index("orch_rule_trigger_idx").on(table.triggerType),
  index("orch_rule_enabled_idx").on(table.isEnabled),
]);

export const orchestratorSettings = pgTable("orchestrator_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  maxConcurrentExecutions: integer("max_concurrent_executions").default(3).notNull(),
  maxQueueSize: integer("max_queue_size").default(50).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  autoRetry: boolean("auto_retry").default(true).notNull(),
  autoOptimize: boolean("auto_optimize").default(true).notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  creditWarningThreshold: integer("credit_warning_threshold").default(100).notNull(),
  defaultPriority: varchar("default_priority", { length: 50 }).default("normal").notNull(),
  allowedModules: jsonb("allowed_modules").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orch_settings_user_idx").on(table.userId),
  unique("orch_settings_user_unique").on(table.userId),
]);

export const orchestratorPipelineRelations = relations(orchestratorPipeline, ({ many }) => ({
  steps: many(orchestratorPipelineStep),
  executions: many(orchestratorExecution),
}));

export const orchestratorPipelineStepRelations = relations(orchestratorPipelineStep, ({ one }) => ({
  pipeline: one(orchestratorPipeline, { fields: [orchestratorPipelineStep.pipelineId], references: [orchestratorPipeline.id] }),
}));

export const orchestratorExecutionRelations = relations(orchestratorExecution, ({ one, many }) => ({
  pipeline: one(orchestratorPipeline, { fields: [orchestratorExecution.pipelineId], references: [orchestratorPipeline.id] }),
  tasks: many(orchestratorTask),
}));

export const orchestratorTaskRelations = relations(orchestratorTask, ({ one }) => ({
  execution: one(orchestratorExecution, { fields: [orchestratorTask.executionId], references: [orchestratorExecution.id] }),
}));

export const orchestratorQueueRelations = relations(orchestratorQueue, ({ one }) => ({
  task: one(orchestratorTask, { fields: [orchestratorQueue.taskId], references: [orchestratorTask.id] }),
}));

export const orchestratorTemplateRelations = relations(orchestratorTemplate, ({ one }) => ({}));
export const orchestratorRuleRelations = relations(orchestratorRule, ({ one }) => ({}));
export const orchestratorSettingsRelations = relations(orchestratorSettings, ({ one }) => ({}));
