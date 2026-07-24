import { pgTable, text, timestamp, jsonb, index, unique, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const job = pgTable(
  "job",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").notNull().default("queued"),
    priority: text("priority").notNull().default("normal"),
    progress: integer("progress").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(3),
    result: jsonb("result").$type<Record<string, unknown>>(),
    error: text("error"),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("job_status_idx").on(table.status),
    index("job_type_idx").on(table.type),
    index("job_priority_idx").on(table.priority),
    index("job_created_at_idx").on(table.createdAt),
  ]
);

export const queue = pgTable(
  "queue",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    depth: integer("depth").notNull().default(0),
    throughput: text("throughput"),
    avgWait: text("avg_wait"),
    status: text("status").notNull().default("active"),
    failed: integer("failed").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("queue_status_idx").on(table.status),
    index("queue_name_idx").on(table.name),
  ]
);

export const jobRelations = relations(job, ({ one }) => ({
  user: one(user, {
    fields: [job.id],
    references: [user.id],
  }),
}));
