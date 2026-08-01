import { db } from "@/lib/db";
import {
  calendarEvent,
  calendarTask,
  calendarReminder,
  calendarRecurring,
} from "@/lib/db/schema/calendar";
import { eq, and, desc, count, gte, lte, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class CalendarService {
  async listEvents(userId: string, filters?: { type?: string; status?: string; startsAfter?: Date; startsBefore?: Date; projectId?: string }) {
    const conditions = [eq(calendarEvent.userId, userId)];
    if (filters?.type) conditions.push(eq(calendarEvent.type, filters.type));
    if (filters?.status) conditions.push(eq(calendarEvent.status, filters.status));
    if (filters?.projectId) conditions.push(eq(calendarEvent.projectId, filters.projectId));
    if (filters?.startsAfter) conditions.push(gte(calendarEvent.startsAt, filters.startsAfter));
    if (filters?.startsBefore) conditions.push(lte(calendarEvent.startsAt, filters.startsBefore));
    return db.select().from(calendarEvent).where(and(...conditions)).orderBy(desc(calendarEvent.startsAt));
  }

  async getEvent(id: string) {
    const rows = await db.select().from(calendarEvent).where(eq(calendarEvent.id, id)).limit(1);
    return rows[0] || null;
  }

  async createEvent(data: { userId: string; projectId?: string; title: string; description?: string; type?: string; category?: string; color?: string; priority?: string; status?: string; platform?: string; metadata?: Record<string, unknown>; startsAt: Date; endsAt?: Date; allDay?: boolean }) {
    const id = generateId("calevt");
    await db.insert(calendarEvent).values({ ...data, id });
    return this.getEvent(id);
  }

  async updateEvent(id: string, data: Partial<typeof calendarEvent.$inferInsert>) {
    await db.update(calendarEvent).set({ ...data, updatedAt: new Date() }).where(eq(calendarEvent.id, id));
    return this.getEvent(id);
  }

  async deleteEvent(id: string) {
    await db.delete(calendarEvent).where(eq(calendarEvent.id, id));
  }

  async listTasks(userId: string, filters?: { status?: string; priority?: string; projectId?: string; dueAfter?: Date; dueBefore?: Date }) {
    const conditions = [eq(calendarTask.userId, userId)];
    if (filters?.status) conditions.push(eq(calendarTask.status, filters.status));
    if (filters?.priority) conditions.push(eq(calendarTask.priority, filters.priority));
    if (filters?.projectId) conditions.push(eq(calendarTask.projectId, filters.projectId));
    if (filters?.dueAfter) conditions.push(gte(calendarTask.dueDate, filters.dueAfter));
    if (filters?.dueBefore) conditions.push(lte(calendarTask.dueDate, filters.dueBefore));
    return db.select().from(calendarTask).where(and(...conditions)).orderBy(desc(calendarTask.createdAt));
  }

  async getTask(id: string) {
    const rows = await db.select().from(calendarTask).where(eq(calendarTask.id, id)).limit(1);
    return rows[0] || null;
  }

  async createTask(data: { userId: string; projectId?: string; eventId?: string; title: string; description?: string; priority?: string; status?: string; progress?: number; dueDate?: Date; estimatedMinutes?: number; checklist?: Array<{ text: string; done: boolean }>; tags?: string[]; metadata?: Record<string, unknown> }) {
    const id = generateId("caltask");
    await db.insert(calendarTask).values({ ...data, id });
    return this.getTask(id);
  }

  async updateTask(id: string, data: Partial<typeof calendarTask.$inferInsert>) {
    await db.update(calendarTask).set({ ...data, updatedAt: new Date() }).where(eq(calendarTask.id, id));
    return this.getTask(id);
  }

  async deleteTask(id: string) {
    await db.delete(calendarTask).where(eq(calendarTask.id, id));
  }

  async listReminders(userId: string) {
    return db.select().from(calendarReminder).where(eq(calendarReminder.userId, userId)).orderBy(desc(calendarReminder.remindAt));
  }

  async getReminder(id: string) {
    const rows = await db.select().from(calendarReminder).where(eq(calendarReminder.id, id)).limit(1);
    return rows[0] || null;
  }

  async createReminder(data: { userId: string; eventId?: string; type?: string; message: string; remindAt: Date; metadata?: Record<string, unknown> }) {
    const id = generateId("calrem");
    await db.insert(calendarReminder).values({ ...data, id });
    return this.getReminder(id);
  }

  async updateReminder(id: string, data: Partial<typeof calendarReminder.$inferInsert>) {
    await db.update(calendarReminder).set(data).where(eq(calendarReminder.id, id));
    return this.getReminder(id);
  }

  async deleteReminder(id: string) {
    await db.delete(calendarReminder).where(eq(calendarReminder.id, id));
  }

  async listRecurring(userId: string) {
    return db.select().from(calendarRecurring).where(eq(calendarRecurring.userId, userId)).orderBy(desc(calendarRecurring.createdAt));
  }

  async getRecurring(id: string) {
    const rows = await db.select().from(calendarRecurring).where(eq(calendarRecurring.id, id)).limit(1);
    return rows[0] || null;
  }

  async createRecurring(data: { userId: string; eventId?: string; frequency: string; interval?: number; endDate?: Date; daysOfWeek?: number[]; nextRunAt?: Date; isActive?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("calrec");
    await db.insert(calendarRecurring).values({ ...data, id });
    return this.getRecurring(id);
  }

  async updateRecurring(id: string, data: Partial<typeof calendarRecurring.$inferInsert>) {
    await db.update(calendarRecurring).set(data).where(eq(calendarRecurring.id, id));
    return this.getRecurring(id);
  }

  async deleteRecurring(id: string) {
    await db.delete(calendarRecurring).where(eq(calendarRecurring.id, id));
  }

  async getStats(userId: string) {
    const [eventCount] = await db.select({ count: count() }).from(calendarEvent).where(eq(calendarEvent.userId, userId));
    const [taskCount] = await db.select({ count: count() }).from(calendarTask).where(eq(calendarTask.userId, userId));
    const [completedTasks] = await db.select({ count: count() }).from(calendarTask).where(and(eq(calendarTask.userId, userId), eq(calendarTask.status, "done")));
    const [pendingTasks] = await db.select({ count: count() }).from(calendarTask).where(and(eq(calendarTask.userId, userId), eq(calendarTask.status, "todo")));
    const [inProgressTasks] = await db.select({ count: count() }).from(calendarTask).where(and(eq(calendarTask.userId, userId), eq(calendarTask.status, "in_progress")));
    const [reminderCount] = await db.select({ count: count() }).from(calendarReminder).where(eq(calendarReminder.userId, userId));
    const [recurringCount] = await db.select({ count: count() }).from(calendarRecurring).where(and(eq(calendarRecurring.userId, userId), eq(calendarRecurring.isActive, true)));
    const [completedEvents] = await db.select({ count: count() }).from(calendarEvent).where(and(eq(calendarEvent.userId, userId), eq(calendarEvent.isCompleted, true)));
    const [upcomingEvents] = await db.select({ count: count() }).from(calendarEvent).where(and(eq(calendarEvent.userId, userId), gte(calendarEvent.startsAt, new Date())));
    return {
      totalEvents: eventCount.count,
      completedEvents: completedEvents.count,
      upcomingEvents: upcomingEvents.count,
      totalTasks: taskCount.count,
      completedTasks: completedTasks.count,
      pendingTasks: pendingTasks.count,
      inProgressTasks: inProgressTasks.count,
      totalReminders: reminderCount.count,
      activeRecurring: recurringCount.count,
    };
  }
}
