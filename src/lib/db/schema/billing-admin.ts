import { pgTable, text, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";

export const billing = pgTable(
  "billing",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    plan: text("plan").notNull(),
    price: text("price").notNull(),
    currency: text("currency").notNull().default("USD"),
    billingCycle: text("billing_cycle").notNull().default("monthly"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("billing_workspace_idx").on(table.workspaceId),
    index("billing_status_idx").on(table.status),
    index("billing_plan_idx").on(table.plan),
  ]
);
