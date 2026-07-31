import { pgTable, text, timestamp, jsonb, index, unique, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const workflow = pgTable(
  "workflow",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    version: text("version").notNull().default("1.0.0"),
    steps: jsonb("steps").$type<Record<string, unknown>[]>().notNull().default([]),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workflow_status_idx").on(table.status),
    index("workflow_name_idx").on(table.name),
  ]
);

export const workflowExecution = pgTable(
  "workflow_execution",
  {
    id: text("id").primaryKey(),
    workflowId: text("workflow_id").notNull().references(() => workflow.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("queued"),
    context: jsonb("context").$type<Record<string, unknown>>().notNull().default({}),
    result: jsonb("result").$type<Record<string, unknown>>(),
    error: text("error"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workflow_execution_workflow_idx").on(table.workflowId),
    index("workflow_execution_status_idx").on(table.status),
    index("workflow_execution_created_at_idx").on(table.createdAt),
  ]
);

export const workflowNode = pgTable("workflow_node", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull().references(() => workflow.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  positionX: text("position_x").default("0").notNull(),
  positionY: text("position_y").default("0").notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workflow_node_workflow_idx").on(table.workflowId),
]);

export const workflowConnection = pgTable("workflow_connection", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull().references(() => workflow.id, { onDelete: "cascade" }),
  sourceNodeId: text("source_node_id").notNull(),
  targetNodeId: text("target_node_id").notNull(),
  sourceHandle: varchar("source_handle", { length: 100 }),
  targetHandle: varchar("target_handle", { length: 100 }),
  label: varchar("label", { length: 200 }),
  condition: jsonb("condition").$type<Record<string, unknown>>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  index("workflow_connection_workflow_idx").on(table.workflowId),
]);

export const workflowVariable = pgTable("workflow_variable", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull().references(() => workflow.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).default("string").notNull(),
  defaultValue: text("default_value"),
  value: text("value"),
  isRequired: boolean("is_required").default(false).notNull(),
  description: text("description"),
}, (table) => [
  index("workflow_variable_workflow_idx").on(table.workflowId),
]);

export const workflowRun = pgTable("workflow_run", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull().references(() => workflow.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  status: varchar("status", { length: 50 }).default("queued").notNull(),
  currentNodeId: text("current_node_id"),
  progress: integer("progress").default(0).notNull(),
  totalNodes: integer("total_nodes").default(0).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  variables: jsonb("variables").$type<Record<string, unknown>>().default({}).notNull(),
  result: jsonb("result").$type<Record<string, unknown>>(),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workflow_run_workflow_idx").on(table.workflowId),
  index("workflow_run_user_idx").on(table.userId),
  index("workflow_run_status_idx").on(table.status),
]);

export const workflowRunLog = pgTable("workflow_run_log", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => workflowRun.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  nodeType: varchar("node_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  input: jsonb("input").$type<Record<string, unknown>>().default({}).notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().default({}).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  executionTimeMs: integer("execution_time_ms"),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workflow_run_log_run_idx").on(table.runId),
]);

export const workflowTemplate = pgTable("workflow_template", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  nodes: jsonb("nodes").$type<Record<string, unknown>[]>().default([]).notNull(),
  connections: jsonb("connections").$type<Record<string, unknown>[]>().default([]).notNull(),
  variables: jsonb("variables").$type<Record<string, unknown>[]>().default([]).notNull(),
  thumbnail: text("thumbnail"),
  usageCount: integer("usage_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workflow_template_category_idx").on(table.category),
]);

export const workflowSchedule = pgTable("workflow_schedule", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").notNull().references(() => workflow.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  scheduleType: varchar("schedule_type", { length: 50 }).notNull(),
  cronExpression: varchar("cron_expression", { length: 100 }),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("workflow_schedule_workflow_idx").on(table.workflowId),
  index("workflow_schedule_next_run_idx").on(table.nextRunAt),
]);

export const workflowRelations = relations(workflow, ({ many }) => ({
  executions: many(workflowExecution),
  nodes: many(workflowNode),
  connections: many(workflowConnection),
  variables: many(workflowVariable),
  runs: many(workflowRun),
  schedules: many(workflowSchedule),
}));

export const workflowExecutionRelations = relations(workflowExecution, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowExecution.workflowId],
    references: [workflow.id],
  }),
}));

export const workflowNodeRelations = relations(workflowNode, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowNode.workflowId],
    references: [workflow.id],
  }),
}));

export const workflowConnectionRelations = relations(workflowConnection, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowConnection.workflowId],
    references: [workflow.id],
  }),
}));

export const workflowVariableRelations = relations(workflowVariable, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowVariable.workflowId],
    references: [workflow.id],
  }),
}));

export const workflowRunRelations = relations(workflowRun, ({ one, many }) => ({
  workflow: one(workflow, {
    fields: [workflowRun.workflowId],
    references: [workflow.id],
  }),
  logs: many(workflowRunLog),
}));

export const workflowRunLogRelations = relations(workflowRunLog, ({ one }) => ({
  run: one(workflowRun, {
    fields: [workflowRunLog.runId],
    references: [workflowRun.id],
  }),
}));

export const workflowScheduleRelations = relations(workflowSchedule, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowSchedule.workflowId],
    references: [workflow.id],
  }),
}));
