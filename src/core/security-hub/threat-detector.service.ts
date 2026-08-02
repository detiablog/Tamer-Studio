import { db } from "@/lib/db";
import { secEvent } from "@/lib/db/schema/security";
import { eq, and, desc, sql, like, gte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export type ThreatType = "brute_force" | "credential_stuffing" | "api_abuse" | "rate_limit" | "suspicious_upload" | "admin_abuse" | "privilege_escalation" | "prompt_injection" | "webhook_abuse" | "unusual_activity" | "session_hijack" | "token_abuse";
export type ThreatSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface ThreatDetectionRule {
  name: string;
  eventType: ThreatType;
  threshold: number;
  windowMinutes: number;
  severity: ThreatSeverity;
}

const DEFAULT_RULES: ThreatDetectionRule[] = [
  { name: "Brute Force Login", eventType: "brute_force", threshold: 5, windowMinutes: 15, severity: "high" },
  { name: "API Rate Limit Abuse", eventType: "api_abuse", threshold: 50, windowMinutes: 5, severity: "medium" },
  { name: "Suspicious Upload Pattern", eventType: "suspicious_upload", threshold: 10, windowMinutes: 30, severity: "medium" },
  { name: "Privilege Escalation", eventType: "privilege_escalation", threshold: 1, windowMinutes: 60, severity: "critical" },
  { name: "Prompt Injection Attempt", eventType: "prompt_injection", threshold: 1, windowMinutes: 60, severity: "high" },
  { name: "Session Hijacking", eventType: "session_hijack", threshold: 1, windowMinutes: 30, severity: "critical" },
  { name: "Rapid Credit Consumption", eventType: "unusual_activity", threshold: 100, windowMinutes: 10, severity: "medium" },
];

export class ThreatDetectorService {
  async recordEvent(data: { eventType: ThreatType; severity?: ThreatSeverity; category: string; source?: string; userId?: string; ipAddress?: string; userAgent?: string; resource?: string; action?: string; details?: Record<string, unknown>; blocked?: boolean; metadata?: Record<string, unknown> }) {
    const id = generateId("sevt");
    return db.insert(secEvent).values({ ...data, id }).returning().then(r => r[0]);
  }

  async listEvents(filters?: { eventType?: string; severity?: string; category?: string; userId?: string; blocked?: boolean; resolved?: boolean; search?: string; startDate?: Date; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.eventType) conditions.push(eq(secEvent.eventType, filters.eventType));
    if (filters?.severity) conditions.push(eq(secEvent.severity, filters.severity));
    if (filters?.category) conditions.push(eq(secEvent.category, filters.category));
    if (filters?.userId) conditions.push(eq(secEvent.userId, filters.userId));
    if (filters?.blocked !== undefined) conditions.push(eq(secEvent.blocked, filters.blocked));
    if (filters?.resolved !== undefined) conditions.push(eq(secEvent.resolved, filters.resolved));
    if (filters?.search) conditions.push(like(secEvent.eventType, `%${filters.search}%`));
    if (filters?.startDate) conditions.push(gte(secEvent.createdAt, filters.startDate));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, total] = await Promise.all([
      db.select().from(secEvent).where(where).orderBy(desc(secEvent.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(secEvent).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async getEvent(id: string) {
    const [item] = await db.select().from(secEvent).where(eq(secEvent.id, id)).limit(1);
    return item || null;
  }

  async resolveEvent(id: string, resolvedBy?: string) {
    return db.update(secEvent).set({ resolved: true, resolvedAt: new Date(), resolvedBy }).where(eq(secEvent.id, id)).returning().then(r => r[0]);
  }

  async getThreatsToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return db.select().from(secEvent).where(gte(secEvent.createdAt, today)).orderBy(desc(secEvent.createdAt));
  }

  async checkRateLimit(userId: string, endpoint: string, maxRequests = 100, windowMinutes = 15): Promise<boolean> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const [count] = await db.select({ count: sql<number>`count(*)` }).from(secEvent).where(and(eq(secEvent.userId, userId), eq(secEvent.resource, endpoint), gte(secEvent.createdAt, since)));
    if (Number(count?.count ?? 0) >= maxRequests) {
      await this.recordEvent({ eventType: "api_abuse", severity: "medium", category: "rate_limit", userId, resource: endpoint, blocked: true, details: { count: Number(count?.count ?? 0), maxRequests } });
      return false;
    }
    return true;
  }

  async checkBruteForce(userId: string, maxAttempts = 5, windowMinutes = 15): Promise<boolean> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const [count] = await db.select({ count: sql<number>`count(*)` }).from(secEvent).where(and(eq(secEvent.userId, userId), eq(secEvent.eventType, "brute_force"), gte(secEvent.createdAt, since)));
    return Number(count?.count ?? 0) < maxAttempts;
  }

  async getStats() {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(secEvent);
    const [blocked] = await db.select({ count: sql<number>`count(*)` }).from(secEvent).where(eq(secEvent.blocked, true));
    const [critical] = await db.select({ count: sql<number>`count(*)` }).from(secEvent).where(eq(secEvent.severity, "critical"));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [todayCount] = await db.select({ count: sql<number>`count(*)` }).from(secEvent).where(gte(secEvent.createdAt, today));
    const byType = await db.select({ eventType: secEvent.eventType, count: sql<number>`count(*)` }).from(secEvent).groupBy(secEvent.eventType);
    return { total: Number(total?.count ?? 0), blocked: Number(blocked?.count ?? 0), critical: Number(critical?.count ?? 0), today: Number(todayCount?.count ?? 0), byType };
  }

  getDefaultRules() { return DEFAULT_RULES; }
}

export const threatDetectorService = new ThreatDetectorService();
