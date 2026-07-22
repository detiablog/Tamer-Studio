import { db } from "@/lib/db";
import { supportSlaPolicy, supportSlaViolation, supportTicket } from "@/lib/db/schema/support";
import { eq, and, desc } from "drizzle-orm";
import type { SLAPolicy, SLAViolation, SLAPriority, SLAType, SLACheckResult } from "./types";
import { randomUUID } from "crypto";

export class SLARepository {
  async createPolicy(input: {
    name: string;
    priority: SLAPriority;
    responseTimeMinutes: number;
    resolutionTimeMinutes: number;
    escalationRules?: Record<string, unknown>;
  }): Promise<SLAPolicy> {
    const id = `sla_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportSlaPolicy).values({
      id,
      name: input.name,
      priority: input.priority,
      responseTimeMinutes: input.responseTimeMinutes,
      resolutionTimeMinutes: input.resolutionTimeMinutes,
      escalationRules: input.escalationRules ?? {},
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return this.mapPolicy(row);
  }

  async getPolicies(): Promise<SLAPolicy[]> {
    const rows = await db.select().from(supportSlaPolicy).orderBy(supportSlaPolicy.priority);
    return rows.map(this.mapPolicy);
  }

  async getPolicy(id: string): Promise<SLAPolicy | undefined> {
    const rows = await db.select().from(supportSlaPolicy).where(eq(supportSlaPolicy.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapPolicy(rows[0]);
  }

  async getPolicyByPriority(priority: SLAPriority): Promise<SLAPolicy | undefined> {
    const rows = await db.select().from(supportSlaPolicy).where(and(eq(supportSlaPolicy.priority, priority), eq(supportSlaPolicy.isActive, true))).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapPolicy(rows[0]);
  }

  async updatePolicy(id: string, input: Partial<{
    name: string;
    responseTimeMinutes: number;
    resolutionTimeMinutes: number;
    escalationRules: Record<string, unknown>;
  }>): Promise<SLAPolicy | undefined> {
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (input.name !== undefined) updates.name = input.name;
    if (input.responseTimeMinutes !== undefined) updates.responseTimeMinutes = input.responseTimeMinutes;
    if (input.resolutionTimeMinutes !== undefined) updates.resolutionTimeMinutes = input.resolutionTimeMinutes;
    if (input.escalationRules !== undefined) updates.escalationRules = input.escalationRules;

    const rows = await db.update(supportSlaPolicy).set(updates).where(eq(supportSlaPolicy.id, id)).returning();
    if (rows.length === 0) return undefined;
    return this.mapPolicy(rows[0]);
  }

  async checkTicketSLA(ticketId: string): Promise<SLACheckResult> {
    const [ticketRows, policyRows] = await Promise.all([
      db.select().from(supportTicket).where(eq(supportTicket.id, ticketId)).limit(1),
      db.select().from(supportSlaPolicy).where(eq(supportSlaPolicy.isActive, true)),
    ]);

    if (ticketRows.length === 0) {
      return { policy: undefined, responseBreached: false, resolutionBreached: false, responseRemainingMinutes: null, resolutionRemainingMinutes: null };
    }

    const ticket = ticketRows[0];
    const dbPolicy = policyRows.find((p) => p.priority === ticket.priority);
    const policy = dbPolicy ? this.mapPolicy(dbPolicy) : undefined;

    if (!policy) {
      return { policy: undefined, responseBreached: false, resolutionBreached: false, responseRemainingMinutes: null, resolutionRemainingMinutes: null };
    }

    const now = new Date();
    const created = ticket.createdAt;
    const elapsedMinutes = (now.getTime() - created.getTime()) / (1000 * 60);

    const responseRemaining = policy.responseTimeMinutes - elapsedMinutes;
    const resolutionRemaining = policy.resolutionTimeMinutes - elapsedMinutes;

    return {
      policy,
      responseBreached: responseRemaining < 0,
      resolutionBreached: resolutionRemaining < 0,
      responseRemainingMinutes: Math.max(0, Math.round(responseRemaining)),
      resolutionRemainingMinutes: Math.max(0, Math.round(resolutionRemaining)),
    };
  }

  async recordViolation(ticketId: string, policyId: string, type: SLAType): Promise<SLAViolation> {
    const id = `sla_violation_${randomUUID()}`;
    const now = new Date();

    const [row] = await db.insert(supportSlaViolation).values({
      id,
      ticketId,
      policyId,
      type,
      violatedAt: now,
      metadata: {},
    }).returning();

    return this.mapViolation(row);
  }

  async getViolations(ticketId?: string): Promise<SLAViolation[]> {
    const rows = ticketId
      ? await db.select().from(supportSlaViolation).where(eq(supportSlaViolation.ticketId, ticketId)).orderBy(desc(supportSlaViolation.violatedAt))
      : await db.select().from(supportSlaViolation).orderBy(desc(supportSlaViolation.violatedAt));

    return rows.map(this.mapViolation);
  }

  private mapPolicy(row: typeof supportSlaPolicy.$inferSelect): SLAPolicy {
    return {
      id: row.id,
      name: row.name,
      priority: row.priority as SLAPolicy["priority"],
      responseTimeMinutes: row.responseTimeMinutes,
      resolutionTimeMinutes: row.resolutionTimeMinutes,
      escalationRules: row.escalationRules as Record<string, unknown> | undefined,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapViolation(row: typeof supportSlaViolation.$inferSelect): SLAViolation {
    return {
      id: row.id,
      ticketId: row.ticketId,
      policyId: row.policyId,
      type: row.type as SLAViolation["type"],
      violatedAt: row.violatedAt,
      metadata: row.metadata as Record<string, unknown> | undefined,
    };
  }
}
