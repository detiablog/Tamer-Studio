import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const calendarEvent = pgTable("calendar_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).default("personal").notNull(),
  category: varchar("category", { length: 50 }),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  platform: varchar("platform", { length: 50 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  allDay: boolean("all_day").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("calendar_event_user_idx").on(table.userId),
  index("calendar_event_project_idx").on(table.projectId),
  index("calendar_event_type_idx").on(table.type),
  index("calendar_event_status_idx").on(table.status),
  index("calendar_event_starts_idx").on(table.startsAt),
  index("calendar_event_ends_idx").on(table.endsAt),
]);

export const calendarTask = pgTable("calendar_task", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  eventId: text("event_id"),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).default("normal").notNull(),
  status: varchar("status", { length: 50 }).default("todo").notNull(),
  progress: integer("progress").default(0).notNull(),
  dueDate: timestamp("due_date"),
  estimatedMinutes: integer("estimated_minutes"),
  checklist: jsonb("checklist").$type<Array<{ text: string; done: boolean }>>().default([]).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("calendar_task_user_idx").on(table.userId),
  index("calendar_task_project_idx").on(table.projectId),
  index("calendar_task_status_idx").on(table.status),
  index("calendar_task_due_idx").on(table.dueDate),
]);

export const calendarReminder = pgTable("calendar_reminder", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventId: text("event_id").references(() => calendarEvent.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).default("notification").notNull(),
  message: text("message").notNull(),
  remindAt: timestamp("remind_at").notNull(),
  isTriggered: boolean("is_triggered").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("calendar_reminder_user_idx").on(table.userId),
  index("calendar_reminder_event_idx").on(table.eventId),
  index("calendar_reminder_remind_idx").on(table.remindAt),
]);

export const calendarRecurring = pgTable("calendar_recurring", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventId: text("event_id").references(() => calendarEvent.id, { onDelete: "cascade" }),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  interval: integer("interval").default(1).notNull(),
  endDate: timestamp("end_date"),
  daysOfWeek: jsonb("days_of_week").$type<number[]>().default([]).notNull(),
  nextRunAt: timestamp("next_run_at"),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("calendar_recurring_user_idx").on(table.userId),
  index("calendar_recurring_next_run_idx").on(table.nextRunAt),
]);

export const calendarEventRelations = relations(calendarEvent, ({ one, many }) => ({
  reminders: many(calendarReminder),
}));

export const calendarTaskRelations = relations(calendarTask, ({ one }) => ({
  event: one(calendarEvent, { fields: [calendarTask.eventId], references: [calendarEvent.id] }),
}));

export const calendarReminderRelations = relations(calendarReminder, ({ one }) => ({
  event: one(calendarEvent, { fields: [calendarReminder.eventId], references: [calendarEvent.id] }),
}));

export const calendarRecurringRelations = relations(calendarRecurring, ({ one }) => ({
  event: one(calendarEvent, { fields: [calendarRecurring.eventId], references: [calendarEvent.id] }),
}));
