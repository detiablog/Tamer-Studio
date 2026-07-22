import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const failedLoginAttempt = pgTable(
  "failed_login_attempt",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    identifier: text("identifier").notNull(),
    reason: text("reason").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("failed_login_email_idx").on(table.email),
    index("failed_login_identifier_idx").on(table.identifier),
    index("failed_login_created_at_idx").on(table.createdAt),
  ]
);
