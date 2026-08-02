import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb, real } from "drizzle-orm/pg-core";

export const betaInvitation = pgTable("beta_invitation", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 200 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  invitedBy: text("invited_by"),
  maxUses: integer("max_uses").default(1).notNull(),
  currentUses: integer("current_uses").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  acceptedAt: timestamp("accepted_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("beta_invite_email_idx").on(table.email),
  index("beta_invite_code_idx").on(table.code),
  index("beta_invite_status_idx").on(table.status),
]);

export const betaUser = pgTable("beta_user", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  invitationId: text("invitation_id"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  role: varchar("role", { length: 50 }).default("tester").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at"),
  feedbackCount: integer("feedback_count").default(0).notNull(),
  bugCount: integer("bug_count").default(0).notNull(),
  featureRequestCount: integer("feature_request_count").default(0).notNull(),
  averageRating: real("average_rating"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("beta_user_user_idx").on(table.userId),
  index("beta_user_status_idx").on(table.status),
]);

export const betaFeedback = pgTable("beta_feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  steps: text("steps"),
  expectedResult: text("expected_result"),
  actualResult: text("actual_result"),
  screenshot: text("screenshot"),
  attachments: jsonb("attachments").$type<string[]>().default([]).notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  rating: integer("rating"),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  version: varchar("version", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("beta_feedback_user_idx").on(table.userId),
  index("beta_feedback_category_idx").on(table.category),
  index("beta_feedback_status_idx").on(table.status),
  index("beta_feedback_severity_idx").on(table.severity),
]);

export const betaBugReport = pgTable("beta_bug_report", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  reproductionSteps: text("reproduction_steps"),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  category: varchar("category", { length: 100 }),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  screenSize: varchar("screen_size", { length: 50 }),
  version: varchar("version", { length: 50 }),
  buildNumber: varchar("build_number", { length: 50 }),
  traceId: varchar("trace_id", { length: 100 }),
  correlationId: varchar("correlation_id", { length: 100 }),
  screenshots: jsonb("screenshots").$type<string[]>().default([]).notNull(),
  attachments: jsonb("attachments").$type<string[]>().default([]).notNull(),
  consoleLogs: text("console_logs"),
  environment: jsonb("environment").$type<Record<string, unknown>>().default({}).notNull(),
  votes: integer("votes").default(0).notNull(),
  assignedTo: text("assigned_to"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("beta_bug_user_idx").on(table.userId),
  index("beta_bug_status_idx").on(table.status),
  index("beta_bug_severity_idx").on(table.severity),
  index("beta_bug_priority_idx").on(table.priority),
]);

export const betaFeatureRequest = pgTable("beta_feature_request", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  businessValue: text("business_value"),
  useCase: text("use_case"),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  votes: integer("votes").default(0).notNull(),
  roadmapTag: varchar("roadmap_tag", { length: 100 }),
  duplicateOf: text("duplicate_of"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("beta_feature_user_idx").on(table.userId),
  index("beta_feature_status_idx").on(table.status),
  index("beta_feature_votes_idx").on(table.votes),
]);

export const betaRating = pgTable("beta_rating", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  ratingType: varchar("rating_type", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: text("entity_id"),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("beta_rating_user_idx").on(table.userId),
  index("beta_rating_type_idx").on(table.ratingType),
]);

export const betaAnnouncement = pgTable("beta_announcement", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("info").notNull(),
  target: varchar("target", { length: 50 }).default("all").notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("beta_announce_type_idx").on(table.type),
  index("beta_announce_published_idx").on(table.isPublished),
]);

export const betaReadiness = pgTable("beta_readiness", {
  id: text("id").primaryKey(),
  overallScore: integer("overall_score").default(0).notNull(),
  category: varchar("category", { length: 100 }),
  bugSeverity: integer("bug_severity").default(0),
  crashRate: real("crash_rate").default(0),
  userSatisfaction: real("user_satisfaction").default(0),
  performance: integer("performance").default(0),
  security: integer("security").default(0),
  localization: integer("localization").default(0),
  accessibility: integer("accessibility").default(0),
  aiSuccessRate: real("ai_success_rate").default(0),
  status: varchar("status", { length: 50 }).default("not_ready").notNull(),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
}, (table) => [
  index("beta_readiness_score_idx").on(table.overallScore),
  index("beta_readiness_status_idx").on(table.status),
]);

export const betaSettings = pgTable("beta_settings", {
  id: text("id").primaryKey(),
  betaEnabled: boolean("beta_enabled").default(true).notNull(),
  maxUsers: integer("max_users").default(100).notNull(),
  requireInvitation: boolean("require_invitation").default(true).notNull(),
  autoApprove: boolean("auto_approve").default(false).notNull(),
  feedbackEnabled: boolean("feedback_enabled").default(true).notNull(),
  bugReportingEnabled: boolean("bug_reporting_enabled").default(true).notNull(),
  featureRequestsEnabled: boolean("feature_requests_enabled").default(true).notNull(),
  announcementsEnabled: boolean("announcements_enabled").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const betaInvitationRelations = relations(betaInvitation, ({ one }) => ({}));
export const betaUserRelations = relations(betaUser, ({ one }) => ({}));
export const betaFeedbackRelations = relations(betaFeedback, ({ one }) => ({}));
export const betaBugReportRelations = relations(betaBugReport, ({ one }) => ({}));
export const betaFeatureRequestRelations = relations(betaFeatureRequest, ({ one }) => ({}));
export const betaRatingRelations = relations(betaRating, ({ one }) => ({}));
export const betaAnnouncementRelations = relations(betaAnnouncement, ({ one }) => ({}));
export const betaReadinessRelations = relations(betaReadiness, ({ one }) => ({}));
export const betaSettingsRelations = relations(betaSettings, ({ one }) => ({}));
