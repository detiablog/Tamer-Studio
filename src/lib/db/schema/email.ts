import { pgTable, text, timestamp, jsonb, index, unique, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const emailProvider = pgTable(
  "email_provider",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(false).notNull(),
    priority: integer("priority").default(0).notNull(),
    routingMode: text("routing_mode").default("priority").notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    credentialsEncrypted: text("credentials_encrypted"),
    senderName: text("sender_name"),
    senderEmail: text("sender_email").notNull(),
    replyTo: text("reply_to"),
    dailyLimit: integer("daily_limit").default(0).notNull(),
    monthlyLimit: integer("monthly_limit").default(0).notNull(),
    timeout: integer("timeout").default(30).notNull(),
    retryCount: integer("retry_count").default(3).notNull(),
    webhookSecret: text("webhook_secret"),
    domain: text("domain"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    lastTestedAt: timestamp("last_tested_at"),
    lastTestStatus: text("last_test_status"),
    lastTestError: text("last_test_error"),
  },
  (table) => [
    unique("email_provider_name_unique").on(table.name),
    unique("email_provider_priority_unique").on(table.priority),
    index("email_provider_active_idx").on(table.isActive),
    index("email_provider_priority_idx").on(table.priority),
    index("email_provider_type_idx").on(table.type),
  ]
);

export const emailProviderHealth = pgTable(
  "email_provider_health",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id").notNull().references(() => emailProvider.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("healthy"),
    latencyMs: integer("latency_ms"),
    lastSuccessAt: timestamp("last_success_at"),
    lastFailureAt: timestamp("last_failure_at"),
    consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
    errorMessage: text("error_message"),
    errorCode: text("error_code"),
    checkedAt: timestamp("checked_at").defaultNow().notNull(),
  },
  (table) => [
    index("email_provider_health_provider_idx").on(table.providerId),
    index("email_provider_health_status_idx").on(table.status),
    index("email_provider_health_checked_idx").on(table.checkedAt),
  ]
);

export const emailQueue = pgTable(
  "email_queue",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    to: text("to").notNull(),
    subject: text("subject").notNull(),
    html: text(),
    text: text(),
    from: text(),
    replyTo: text(),
    cc: jsonb("cc").$type<string[]>().notNull().default([]),
    bcc: jsonb("bcc").$type<string[]>().notNull().default([]),
    headers: jsonb("headers").$type<Record<string, string>>().notNull().default({}),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").notNull().default("queued"),
    priority: integer("priority").default(0).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    failedAt: timestamp("failed_at"),
    error: text("error"),
    response: jsonb("response").$type<Record<string, unknown>>(),
    providerId: text("provider_id").references(() => emailProvider.id),
    providerName: text("provider_name"),
    latencyMs: integer("latency_ms"),
    templateId: text("template_id").references(() => emailTemplate.id),
    category: text("category"),
    scheduledTimezone: text("scheduled_timezone"),
    attachments: jsonb("attachments").$type<unknown[]>().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("email_queue_status_idx").on(table.status),
    index("email_queue_type_idx").on(table.type),
    index("email_queue_priority_idx").on(table.priority),
    index("email_queue_provider_idx").on(table.providerId),
    index("email_queue_created_idx").on(table.createdAt),
    index("email_queue_scheduled_idx").on(table.scheduledAt),
    index("email_queue_template_idx").on(table.templateId),
  ]
);

export const emailLog = pgTable(
  "email_log",
  {
    id: text("id").primaryKey(),
    queueId: text("queue_id").references(() => emailQueue.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    to: text("to").notNull(),
    subject: text("subject").notNull(),
    from: text(),
    replyTo: text(),
    providerId: text("provider_id").references(() => emailProvider.id),
    providerName: text("provider_name"),
    status: text("status").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    latencyMs: integer("latency_ms"),
    responseCode: integer("response_code"),
    responseMessage: text("response_message"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    templateId: text("template_id").references(() => emailTemplate.id),
    renderedHtml: text("rendered_html"),
    renderedText: text("rendered_text"),
    headers: jsonb("headers").$type<Record<string, string>>().notNull().default({}),
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("email_log_status_idx").on(table.status),
    index("email_log_type_idx").on(table.type),
    index("email_log_provider_idx").on(table.providerId),
    index("email_log_created_idx").on(table.createdAt),
    index("email_log_to_idx").on(table.to),
    index("email_log_template_idx").on(table.templateId),
  ]
);

export const emailToken = pgTable(
  "email_token",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    email: text("email").notNull(),
    token: text("token").notNull(),
    userId: text("user_id"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("email_token_token_unique").on(table.token),
    index("email_token_email_idx").on(table.email),
    index("email_token_type_idx").on(table.type),
    index("email_token_expires_idx").on(table.expiresAt),
    index("email_token_user_idx").on(table.userId),
  ]
);

export const emailTemplate = pgTable(
  "email_template",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    text: text("text"),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    isActive: boolean("is_active").default(true).notNull(),
    description: text("description"),
    language: text("language").default("en").notNull(),
    version: integer("version").default(1).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    category: text("category"),
    builderBlocks: jsonb("builder_blocks").$type<unknown[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
  },
  (table) => [
    unique("email_template_key_unique").on(table.key),
    index("email_template_type_idx").on(table.type),
    index("email_template_active_idx").on(table.isActive),
    index("email_template_category_idx").on(table.category),
  ]
);

export const emailTemplateVersion = pgTable(
  "email_template_version",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id").notNull().references(() => emailTemplate.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    subject: text("subject").notNull(),
    html: text("html").notNull(),
    text: text("text"),
    variables: jsonb("variables").$type<string[]>().notNull().default([]),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("email_template_version_template_idx").on(table.templateId),
    unique("email_template_version_unique").on(table.templateId, table.version),
  ]
);

export const emailAttachment = pgTable(
  "email_attachment",
  {
    id: text("id").primaryKey(),
    queueId: text("queue_id").references(() => emailQueue.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    path: text("path").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("email_attachment_queue_idx").on(table.queueId),
  ]
);

export const emailStatistics = pgTable(
  "email_statistics",
  {
    id: text("id").primaryKey(),
    providerId: text("provider_id").references(() => emailProvider.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    sent: integer("sent").default(0).notNull(),
    delivered: integer("delivered").default(0).notNull(),
    failed: integer("failed").default(0).notNull(),
    retry: integer("retry").default(0).notNull(),
    bounce: integer("bounce").default(0).notNull(),
    avgLatencyMs: integer("avg_latency_ms"),
    quotaUsed: integer("quota_used").default(0).notNull(),
    quotaTotal: integer("quota_total").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("email_statistics_provider_date_unique").on(table.providerId, table.date),
    index("email_statistics_provider_idx").on(table.providerId),
    index("email_statistics_date_idx").on(table.date),
  ]
);

export const emailProviderRelations = relations(emailProvider, ({ many }) => ({
  healthRecords: many(emailProviderHealth),
  queueItems: many(emailQueue),
  logs: many(emailLog),
  statistics: many(emailStatistics),
}));

export const emailProviderHealthRelations = relations(emailProviderHealth, ({ one }) => ({
  provider: one(emailProvider, {
    fields: [emailProviderHealth.providerId],
    references: [emailProvider.id],
  }),
}));

export const emailQueueRelations = relations(emailQueue, ({ one, many }) => ({
  provider: one(emailProvider, {
    fields: [emailQueue.providerId],
    references: [emailProvider.id],
  }),
  template: one(emailTemplate, {
    fields: [emailQueue.templateId],
    references: [emailTemplate.id],
  }),
  attachments: many(emailAttachment),
}));

export const emailLogRelations = relations(emailLog, ({ one }) => ({
  provider: one(emailProvider, {
    fields: [emailLog.providerId],
    references: [emailProvider.id],
  }),
  queue: one(emailQueue, {
    fields: [emailLog.queueId],
    references: [emailQueue.id],
  }),
  template: one(emailTemplate, {
    fields: [emailLog.templateId],
    references: [emailTemplate.id],
  }),
}));

export const emailTemplateRelations = relations(emailTemplate, ({ many }) => ({
  queueItems: many(emailQueue),
  logs: many(emailLog),
  versions: many(emailTemplateVersion),
}));

export const emailTemplateVersionRelations = relations(emailTemplateVersion, ({ one }) => ({
  template: one(emailTemplate, {
    fields: [emailTemplateVersion.templateId],
    references: [emailTemplate.id],
  }),
}));

export const emailAttachmentRelations = relations(emailAttachment, ({ one }) => ({
  queue: one(emailQueue, {
    fields: [emailAttachment.queueId],
    references: [emailQueue.id],
  }),
}));

export const emailStatisticsRelations = relations(emailStatistics, ({ one }) => ({
  provider: one(emailProvider, {
    fields: [emailStatistics.providerId],
    references: [emailProvider.id],
  }),
}));
