import { db } from "@/lib/db";
import { subscription } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Plan, PlanFeature, Subscription } from "@/lib/ai/types/billing";
import { defaultPlans } from "./plans";

export interface SubscriptionRepository {
  getSubscription(workspaceId: string): Promise<Subscription | undefined>;
  createSubscription(workspaceId: string, planId: string): Promise<Subscription>;
  updateSubscriptionStatus(workspaceId: string, status: Subscription["status"]): Promise<void>;
}

export class DefaultSubscriptionRepository implements SubscriptionRepository {
  async getSubscription(workspaceId: string): Promise<Subscription | undefined> {
    const rows = await db.select().from(subscription).where(eq(subscription.workspaceId, workspaceId)).limit(1);
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      planId: row.planId,
      status: row.status as Subscription["status"],
      currentPeriodStart: row.currentPeriodStart.toISOString(),
      currentPeriodEnd: row.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: row.cancelAtPeriodEnd === "true",
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async createSubscription(workspaceId: string, planId: string): Promise<Subscription> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    await db.insert(subscription).values({
      id,
      workspaceId,
      planId,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: "false",
      metadata: {},
    });
    return {
      id,
      workspaceId,
      planId,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      metadata: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async updateSubscriptionStatus(workspaceId: string, status: Subscription["status"]): Promise<void> {
    const now = new Date();
    await db.update(subscription).set({ status, updatedAt: now }).where(eq(subscription.workspaceId, workspaceId));
  }
}

export class PlanService {
  private planCache = new Map<string, Plan>();

  constructor() {
    for (const plan of defaultPlans) {
      this.planCache.set(plan.id, plan);
    }
  }

  getPlan(planId: string): Plan | undefined {
    return this.planCache.get(planId);
  }

  listPlans(): Plan[] {
    return Array.from(this.planCache.values());
  }

  getPlanLimits(planId: string): Plan["limits"] | undefined {
    return this.planCache.get(planId)?.limits;
  }

  getPlanFeatures(planId: string): PlanFeature[] | undefined {
    return this.planCache.get(planId)?.features;
  }
}
