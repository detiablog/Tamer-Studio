import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const agent = pgTable("agent", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  avatar: text("avatar"),
  type: varchar("type", { length: 50 }).default("general").notNull(),
  role: varchar("role", { length: 100 }),
  mission: text("mission"),
  goals: jsonb("goals").$type<string[]>().default([]).notNull(),
  instructions: text("instructions"),
  behavior: jsonb("behavior").$type<Record<string, unknown>>().default({}).notNull(),
  allowedTools: jsonb("allowed_tools").$type<string[]>().default([]).notNull(),
  allowedModels: jsonb("allowed_models").$type<string[]>().default([]).notNull(),
  maxCredits: integer("max_credits").default(1000),
  maxRuntimeMs: integer("max_runtime_ms").default(300000),
  temperature: text("temperature").default("0.7"),
  creativity: text("creativity").default("balanced"),
  reasoningLevel: varchar("reasoning_level", { length: 50 }).default("standard"),
  language: varchar("language", { length: 10 }).default("en"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("agent_user_idx").on(table.userId),
  index("agent_type_idx").on(table.type),
  index("agent_status_idx").on(table.status),
]);

export const agentTask = pgTable("agent_task", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agent.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  priority: varchar("priority", { length: 20 }).default("normal"),
  input: jsonb("input").$type<Record<string, unknown>>().default({}).notNull(),
  output: jsonb("output").$type<Record<string, unknown>>().default({}).notNull(),
  plan: jsonb("plan").$type<Array<{ step: string; status: string }>>().default([]).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("agent_task_agent_idx").on(table.agentId),
  index("agent_task_user_idx").on(table.userId),
  index("agent_task_status_idx").on(table.status),
]);

export const agentRun = pgTable("agent_run", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull().references(() => agentTask.id, { onDelete: "cascade" }),
  agentId: text("agent_id").notNull().references(() => agent.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("running").notNull(),
  model: varchar("model", { length: 200 }),
  provider: varchar("provider", { length: 100 }),
  messages: jsonb("messages").$type<Array<{ role: string; content: string }>>().default([]).notNull(),
  toolCalls: jsonb("tool_calls").$type<Array<{ tool: string; input: Record<string, unknown>; output: Record<string, unknown>; status: string }>>().default([]).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  tokensUsed: integer("tokens_used").default(0).notNull(),
  executionTimeMs: integer("execution_time_ms"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("agent_run_task_idx").on(table.taskId),
  index("agent_run_agent_idx").on(table.agentId),
  index("agent_run_status_idx").on(table.status),
]);

export const agentMemory = pgTable("agent_memory", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agent.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).default("short_term").notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("agent_memory_agent_idx").on(table.agentId),
  index("agent_memory_type_idx").on(table.type),
]);

export const agentKnowledge = pgTable("agent_knowledge", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agent.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  sourceId: text("source_id"),
  content: text("content"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("agent_knowledge_agent_idx").on(table.agentId),
]);

export const agentRelations = relations(agent, ({ many }) => ({
  tasks: many(agentTask),
  memories: many(agentMemory),
  knowledge: many(agentKnowledge),
}));

export const agentTaskRelations = relations(agentTask, ({ one, many }) => ({
  agent: one(agent, { fields: [agentTask.agentId], references: [agent.id] }),
  runs: many(agentRun),
}));

export const agentRunRelations = relations(agentRun, ({ one }) => ({
  task: one(agentTask, { fields: [agentRun.taskId], references: [agentTask.id] }),
  agent: one(agent, { fields: [agentRun.agentId], references: [agent.id] }),
}));

export const agentMemoryRelations = relations(agentMemory, ({ one }) => ({
  agent: one(agent, { fields: [agentMemory.agentId], references: [agent.id] }),
}));

export const agentKnowledgeRelations = relations(agentKnowledge, ({ one }) => ({
  agent: one(agent, { fields: [agentKnowledge.agentId], references: [agent.id] }),
}));
