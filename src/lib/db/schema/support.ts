import { pgTable, text, timestamp, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const supportTicket = pgTable(
  "support_ticket",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id"),
    category: text("category").notNull(),
    priority: text("priority").default("medium").notNull(),
    status: text("status").default("draft").notNull(),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("support_ticket_user_id_idx").on(table.userId),
    index("support_ticket_status_idx").on(table.status),
    index("support_ticket_priority_idx").on(table.priority),
    index("support_ticket_assigned_to_idx").on(table.assignedTo),
    index("support_ticket_created_at_idx").on(table.createdAt),
  ]
);

export const supportTicketComment = pgTable(
  "support_ticket_comment",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isInternal: boolean("is_internal").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("support_ticket_comment_ticket_id_idx").on(table.ticketId),
    index("support_ticket_comment_user_id_idx").on(table.userId),
  ]
);

export const supportKnowledgeCategory = pgTable(
  "support_knowledge_category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    parentId: text("parent_id").references(() => supportKnowledgeCategory.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("support_knowledge_category_parent_id_idx").on(table.parentId),
  ]
) as any; // eslint-disable-next-line @typescript-eslint/no-explicit-any

export const supportKnowledgeArticle = pgTable(
  "support_knowledge_article",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => supportKnowledgeCategory.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    status: text("status").default("draft").notNull(),
    version: integer("version").default(1).notNull(),
    relatedArticles: jsonb("related_articles").$type<string[]>().default([]),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("support_knowledge_article_category_id_idx").on(table.categoryId),
    index("support_knowledge_article_status_idx").on(table.status),
  ]
);

export const supportFeedback = pgTable(
  "support_feedback",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticketId: text("ticket_id").references(() => supportTicket.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    rating: integer("rating"),
    comment: text("comment"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("support_feedback_user_id_idx").on(table.userId),
    index("support_feedback_ticket_id_idx").on(table.ticketId),
    index("support_feedback_type_idx").on(table.type),
  ]
);

export const supportCustomerTimeline = pgTable(
  "support_customer_timeline",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("support_customer_timeline_user_id_idx").on(table.userId),
    index("support_customer_timeline_type_idx").on(table.type),
    index("support_customer_timeline_created_at_idx").on(table.createdAt),
  ]
);

export const supportSlaPolicy = pgTable(
  "support_sla_policy",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    priority: text("priority").notNull(),
    responseTimeMinutes: integer("response_time_minutes").notNull(),
    resolutionTimeMinutes: integer("resolution_time_minutes").notNull(),
    escalationRules: jsonb("escalation_rules").$type<Record<string, unknown>>().default({}),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("support_sla_policy_priority_idx").on(table.priority),
    index("support_sla_policy_is_active_idx").on(table.isActive),
  ]
);

export const supportSlaViolation = pgTable(
  "support_sla_violation",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    policyId: text("policy_id")
      .notNull()
      .references(() => supportSlaPolicy.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    violatedAt: timestamp("violated_at").defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    index("support_sla_violation_ticket_id_idx").on(table.ticketId),
    index("support_sla_violation_policy_id_idx").on(table.policyId),
  ]
);

export const supportAttachment = pgTable(
  "support_attachment",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("support_attachment_ticket_id_idx").on(table.ticketId),
    index("support_attachment_uploaded_by_idx").on(table.uploadedBy),
  ]
);

export const supportInternalNote = pgTable(
  "support_internal_note",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => supportTicket.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("support_internal_note_ticket_id_idx").on(table.ticketId),
    index("support_internal_note_created_by_idx").on(table.createdBy),
  ]
);

export const supportTicketRelations = relations(supportTicket, ({ one, many }) => ({
  user: one(user, {
    fields: [supportTicket.userId],
    references: [user.id],
  }),
  assignee: one(user, {
    fields: [supportTicket.assignedTo],
    references: [user.id],
  }),
  comments: many(supportTicketComment),
  attachments: many(supportAttachment),
  internalNotes: many(supportInternalNote),
}));

export const supportTicketCommentRelations = relations(supportTicketComment, ({ one }) => ({
  ticket: one(supportTicket, {
    fields: [supportTicketComment.ticketId],
    references: [supportTicket.id],
  }),
  user: one(user, {
    fields: [supportTicketComment.userId],
    references: [user.id],
  }),
}));

export const supportKnowledgeCategoryRelations = relations(supportKnowledgeCategory, ({ one, many }) => ({
  parent: one(supportKnowledgeCategory, {
    fields: [supportKnowledgeCategory.parentId],
    references: [supportKnowledgeCategory.id],
  }),
  articles: many(supportKnowledgeArticle),
}));

export const supportKnowledgeArticleRelations = relations(supportKnowledgeArticle, ({ one }) => ({
  category: one(supportKnowledgeCategory, {
    fields: [supportKnowledgeArticle.categoryId],
    references: [supportKnowledgeCategory.id],
  }),
}));

export const supportFeedbackRelations = relations(supportFeedback, ({ one }) => ({
  user: one(user, {
    fields: [supportFeedback.userId],
    references: [user.id],
  }),
  ticket: one(supportTicket, {
    fields: [supportFeedback.ticketId],
    references: [supportTicket.id],
  }),
}));

export const supportAttachmentRelations = relations(supportAttachment, ({ one }) => ({
  ticket: one(supportTicket, {
    fields: [supportAttachment.ticketId],
    references: [supportTicket.id],
  }),
  uploader: one(user, {
    fields: [supportAttachment.uploadedBy],
    references: [user.id],
  }),
}));

export const supportInternalNoteRelations = relations(supportInternalNote, ({ one }) => ({
  ticket: one(supportTicket, {
    fields: [supportInternalNote.ticketId],
    references: [supportTicket.id],
  }),
  author: one(user, {
    fields: [supportInternalNote.createdBy],
    references: [user.id],
  }),
}));

export const supportSlaViolationRelations = relations(supportSlaViolation, ({ one }) => ({
  ticket: one(supportTicket, {
    fields: [supportSlaViolation.ticketId],
    references: [supportTicket.id],
  }),
  policy: one(supportSlaPolicy, {
    fields: [supportSlaViolation.policyId],
    references: [supportSlaPolicy.id],
  }),
}));
