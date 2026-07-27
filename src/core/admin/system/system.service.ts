import type { SystemConfig, RuntimeInfo } from "./system.types";
import { MaintenanceService } from "../maintenance";
import { SettingsService } from "../settings";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { user, organization, workspace, aiProvider, job, queue, coupon, subscription } from "@/lib/db/schema";
import { eq, ilike, or, desc, and, gte, lt, count, sum, avg } from "drizzle-orm";
import os from "os";

export class SystemService {
  private maintenanceService = new MaintenanceService();
  private settingsService = new SettingsService();

  async checkDatabaseHealth(): Promise<{ status: string; latencyMs?: number }> {
    const start = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      return { status: "healthy", latencyMs: Date.now() - start };
    } catch {
      return { status: "unhealthy" };
    }
  }

  async search(query: string): Promise<Array<{ type: string; id: string; label: string; description?: string; href: string }>> {
    const pattern = `%${query.replace(/%/g, "\\%")}%`;
    const results: Array<{ type: string; id: string; label: string; description?: string; href: string }> = [];

    const [users, orgs, workspaces, providers, jobs, queues, coupons, subscriptionsRows] = await Promise.all([
      db.select({ id: user.id, label: user.name, description: user.email }).from(user).where(or(ilike(user.name, pattern), ilike(user.email, pattern))).limit(5),
      db.select({ id: organization.id, label: organization.name }).from(organization).where(ilike(organization.name, pattern)).limit(5),
      db.select({ id: workspace.id, label: workspace.name, description: workspace.slug }).from(workspace).where(ilike(workspace.name, pattern)).limit(5),
      db.select({ id: aiProvider.id, label: aiProvider.name, description: aiProvider.providerType }).from(aiProvider).where(ilike(aiProvider.name, pattern)).limit(5),
      db.select({ id: job.id, label: job.type, description: job.status }).from(job).where(ilike(job.type, pattern)).limit(5),
      db.select({ id: queue.id, label: queue.name }).from(queue).where(ilike(queue.name, pattern)).limit(5),
      db.select({ id: coupon.id, label: coupon.code, description: coupon.type }).from(coupon).where(ilike(coupon.code, pattern)).limit(5),
      db.select({ id: subscription.id, label: subscription.planId, description: subscription.status }).from(subscription).where(ilike(subscription.planId, pattern)).limit(5),
    ]);

    for (const u of users) results.push({ type: "users", id: u.id, label: u.label, description: u.description, href: `/admin/users` });
    for (const o of orgs) results.push({ type: "organizations", id: o.id, label: o.label, href: `/admin/organizations` });
    for (const w of workspaces) results.push({ type: "workspaces", id: w.id, label: w.label, description: w.description, href: `/admin/workspaces` });
    for (const p of providers) results.push({ type: "providers", id: p.id, label: p.label, description: p.description, href: `/admin/ai-providers` });
    for (const j of jobs) results.push({ type: "jobs", id: j.id, label: j.label, description: j.description, href: `/admin/jobs` });
    for (const q of queues) results.push({ type: "queues", id: q.id, label: q.label, href: `/admin/queues` });
    for (const c of coupons) results.push({ type: "coupons", id: c.id, label: c.label, description: c.description, href: `/admin/coupons` });
    for (const s of subscriptionsRows) results.push({ type: "subscriptions", id: s.id, label: s.label, description: s.description, href: `/admin/subscriptions` });

    return results;
  }

  async getSystemConfig(): Promise<SystemConfig> {
    const [maintenanceStatus, settings] = await Promise.all([
      this.maintenanceService.getStatus(),
      this.settingsService.getGlobalSettings(),
    ]);

    const modules = [
      { name: "auth", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "identity", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "rbac", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "audit", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "events", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "billing", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "commerce", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "notifications", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "support", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "usage", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "credits", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
    ];

    return {
      platform: {
        platformName: settings.platformName,
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        region: process.env.APP_REGION || "default",
        maintenanceMode: maintenanceStatus.mode === "maintenance",
        readOnlyMode: maintenanceStatus.mode === "read_only",
        registrationOpen: settings.registrationOpen,
        maxUploadSize: settings.maxUploadSize,
        rateLimitPerMinute: settings.rateLimitPerMinute,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0,
        databaseConnected: true,
        redisConnected: false,
      },
      services: [
        { name: "identity", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "workspace", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "billing", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "commerce", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "notifications", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "support", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "ai-gateway", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
        { name: "workflow-engine", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      ],
      modules,
      configValidation: {
        valid: true,
        errors: [],
        warnings: [],
      },
    };
  }

  async getRuntimeInfo(): Promise<RuntimeInfo> {
    const memUsage = process.memoryUsage();
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0] || 0;
    const cpuUsage = loadAvg / cpus.length * 100;

    return {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      cpuUsage: Math.round(cpuUsage),
      activeHandles: 0,
      activeRequests: 0,
      eventLoopLag: 0,
    };
  }

  async validateConfiguration(): Promise<{ valid: boolean; errors: SystemConfig["configValidation"]["errors"]; warnings: SystemConfig["configValidation"]["warnings"] }> {
    const errors: { key: string; message: string; severity: "error" }[] = [];
    const warnings: { key: string; message: string; severity: "warning" }[] = [];

    const requiredVars = ["DATABASE_URL"];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push({ key: varName, message: `${varName} is required`, severity: "error" });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  async getServiceRegistry(): Promise<{ name: string; status: string; lastChecked: Date; responseTime: number; errorMessage?: string; version?: string }[]> {
    return [
      { name: "identity", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "workspace", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "billing", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "commerce", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "notifications", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "support", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "ai-gateway", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
      { name: "workflow-engine", status: "healthy" as const, lastChecked: new Date(), responseTime: 0, version: "1.0.0" },
    ];
  }

  async getModuleHealth(): Promise<{ name: string; status: string; initialized: boolean; errorMessage?: string; lastHealthCheck: Date }[]> {
    return [
      { name: "auth", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "identity", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "rbac", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "audit", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "events", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "billing", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "commerce", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "notifications", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "support", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "usage", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
      { name: "credits", status: "healthy" as const, initialized: true, lastHealthCheck: new Date() },
    ];
  }
}
