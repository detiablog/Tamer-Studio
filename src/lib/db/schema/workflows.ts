import { pgTable, text, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
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

export const workflowRelations = relations(workflow, ({ many }) => ({
  executions: many(workflowExecution),
}));

export const workflowExecutionRelations = relations(workflowExecution, ({ one }) => ({
  workflow: one(workflow, {
    fields: [workflowExecution.workflowId],
    references: [workflow.id],
  }),
}));
