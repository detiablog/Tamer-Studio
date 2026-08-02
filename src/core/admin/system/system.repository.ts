import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { user, workspace, aiProvider, job, queue, coupon, subscription } from "@/lib/db/schema";
import { ilike, or, eq } from "drizzle-orm";

export interface SearchResult {
  type: string;
  id: string;
  label: string;
  description?: string;
  href: string;
}

export class SystemRepository {
  async checkDatabaseHealth(): Promise<{ status: string; latencyMs?: number }> {
    const start = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      return { status: "healthy", latencyMs: Date.now() - start };
    } catch {
      return { status: "unhealthy" };
    }
  }

  async searchUsers(pattern: string, limit = 5) {
    return db
      .select({ id: user.id, label: user.name, description: user.email })
      .from(user)
      .where(or(ilike(user.name, pattern), ilike(user.email, pattern)))
      .limit(limit);
  }

  async searchOrganizations(pattern: string, limit = 5) {
    return [] as Array<{ id: string; label: string; description?: string }>;
  }

  async searchWorkspaces(pattern: string, limit = 5) {
    return db
      .select({ id: workspace.id, label: workspace.name, description: workspace.slug })
      .from(workspace)
      .where(ilike(workspace.name, pattern))
      .limit(limit);
  }

  async searchProviders(pattern: string, limit = 5) {
    return db
      .select({ id: aiProvider.id, label: aiProvider.name, description: aiProvider.providerType })
      .from(aiProvider)
      .where(ilike(aiProvider.name, pattern))
      .limit(limit);
  }

  async searchJobs(pattern: string, limit = 5) {
    return db
      .select({ id: job.id, label: job.type, description: job.status })
      .from(job)
      .where(ilike(job.type, pattern))
      .limit(limit);
  }

  async searchQueues(pattern: string, limit = 5) {
    return db
      .select({ id: queue.id, label: queue.name })
      .from(queue)
      .where(ilike(queue.name, pattern))
      .limit(limit);
  }

  async searchCoupons(pattern: string, limit = 5) {
    return db
      .select({ id: coupon.id, label: coupon.code, description: coupon.type })
      .from(coupon)
      .where(ilike(coupon.code, pattern))
      .limit(limit);
  }

  async searchSubscriptions(pattern: string, limit = 5) {
    return db
      .select({ id: subscription.id, label: subscription.planId, description: subscription.status })
      .from(subscription)
      .where(ilike(subscription.planId, pattern))
      .limit(limit);
  }
}

export const systemRepository = new SystemRepository();
