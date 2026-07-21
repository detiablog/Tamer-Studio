import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const admin = pgTable("admin", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("admin_email_idx").on(table.email),
]);

export const adminSession = pgTable(
  "admin_session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    adminId: text("admin_id")
      .notNull()
      .references(() => admin.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("admin_session_adminId_idx").on(table.adminId),
    index("admin_session_token_idx").on(table.token),
  ]
);
