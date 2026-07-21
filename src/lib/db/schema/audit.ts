import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    action: text("action").notNull(),
    actorId: text("actor_id"),
    actorType: text("actor_type"),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_action_idx").on(table.action),
    index("audit_log_actorId_idx").on(table.actorId),
    index("audit_log_createdAt_idx").on(table.createdAt),
  ]
);
