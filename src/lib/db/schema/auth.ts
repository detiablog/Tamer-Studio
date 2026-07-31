import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en").notNull(),
  preferredCurrency: varchar("preferred_currency", { length: 10 }).default("USD").notNull(),
  preferredCountry: varchar("preferred_country", { length: 10 }),
  preferredTimezone: varchar("preferred_timezone", { length: 100 }),
  autoDetectLocale: boolean("auto_detect_locale").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const emailVerificationLog = pgTable(
  "email_verification_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    resendCount: integer("resend_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("email_verification_log_user_idx").on(table.userId),
    index("email_verification_log_token_idx").on(table.tokenHash),
  ]
);

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  verificationLogs: many(emailVerificationLog),
  twoFactor: one(userTwoFactor),
  trustedDevices: many(trustedDevice),
  securityEvents: many(securityEvent),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const emailVerificationLogRelations = relations(emailVerificationLog, ({ one }) => ({
  user: one(user, {
    fields: [emailVerificationLog.userId],
    references: [user.id],
  }),
}));

export const userTwoFactor = pgTable("user_two_factor", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  enabled: boolean("enabled").default(false).notNull(),
  encryptedSecret: text("encrypted_secret"),
  backupCodes: jsonb("backup_codes").$type<string[]>().default([]).notNull(),
  enabledAt: timestamp("enabled_at"),
  lastVerifiedAt: timestamp("last_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("user_two_factor_user_idx").on(table.userId)]);

export const trustedDevice = pgTable("trusted_device", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  deviceName: text("device_name"),
  browser: text("browser"),
  os: text("os"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("trusted_device_user_idx").on(table.userId),
  index("trusted_device_token_idx").on(table.token),
]);

export const securityEvent = pgTable("security_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  description: text("description"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("security_event_user_idx").on(table.userId),
  index("security_event_type_idx").on(table.eventType),
  index("security_event_created_idx").on(table.createdAt),
]);

export const userTwoFactorRelations = relations(userTwoFactor, ({ one }) => ({
  user: one(user, { fields: [userTwoFactor.userId], references: [user.id] }),
}));
export const trustedDeviceRelations = relations(trustedDevice, ({ one }) => ({
  user: one(user, { fields: [trustedDevice.userId], references: [user.id] }),
}));
export const securityEventRelations = relations(securityEvent, ({ one }) => ({
  user: one(user, { fields: [securityEvent.userId], references: [user.id] }),
}));
