import { pgTable, text, timestamp, boolean, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const admin = pgTable(
  "admin",
  {
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
  },
  (table) => [
    unique("admin_email_unique").on(table.email),
    index("admin_email_idx").on(table.email),
    index("admin_role_idx").on(table.role),
  ]
);

export const adminSession = pgTable(
  "admin_session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    adminId: text("admin_id").notNull().references(() => admin.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("admin_session_token_unique").on(table.token),
    index("admin_session_token_idx").on(table.token),
    index("admin_session_adminId_idx").on(table.adminId),
  ]
);

export const adminRelations = relations(admin, ({ many }) => ({
  sessions: many(adminSession),
}));

export const adminSessionRelations = relations(adminSession, ({ one }) => ({
  admin: one(admin, {
    fields: [adminSession.adminId],
    references: [admin.id],
  }),
}));
