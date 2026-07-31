import { db } from "@/lib/db";
import { systemHealth, systemMetric, systemAlert, systemIncident, systemDependency } from "@/lib/db/schema/monitoring";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { cacheGetOrSet } from "@/lib/cache";

export type ServiceStatus = "healthy" | "warning" | "critical" | "offline" | "unknown";
export type IncidentSeverity = "minor" | "major" | "critical";
export type IncidentStatus = "open" | "investigating" | "identified" | "monitoring" | "resolved" | "closed";

export class MonitoringEngine {
  async checkHealth(serviceName: string, serviceType: string): Promise<{ status: ServiceStatus; latencyMs?: number; error?: string }> {
    const start = Date.now();
    let status: ServiceStatus = "healthy";
    let latencyMs: number | undefined;
    let error: string | undefined;

    try {
      if (serviceType === "database") {
        await db.execute(sql`SELECT 1`);
        latencyMs = Date.now() - start;
      } else {
        latencyMs = Date.now() - start;
        status = "healthy";
      }
    } catch (err) {
      latencyMs = Date.now() - start;
      status = "offline";
      error = err instanceof Error ? err.message : "Unknown error";
    }

    const [existing] = await db.select().from(systemHealth).where(eq(systemHealth.serviceName, serviceName)).limit(1);
    if (existing) {
      await db.update(systemHealth).set({
        status, latencyMs, errorMessage: error || null,
        lastCheckedAt: new Date(),
        lastHealthyAt: status === "healthy" ? new Date() : existing.lastHealthyAt,
        lastErrorAt: status !== "healthy" ? new Date() : existing.lastErrorAt,
      }).where(eq(systemHealth.id, existing.id));
    } else {
      await db.insert(systemHealth).values({
        id: generateId("health"), serviceName, serviceType, status, latencyMs,
        lastCheckedAt: new Date(),
        lastHealthyAt: status === "healthy" ? new Date() : null,
        lastErrorAt: status !== "healthy" ? new Date() : null,
        errorMessage: error || null,
      });
    }

    return { status, latencyMs, error };
  }

  async getAllHealth() {
    return cacheGetOrSet("monitoring:health:all", async () => {
      return db.select().from(systemHealth).orderBy(systemHealth.serviceName);
    }, 60000);
  }

  async recordMetric(metricName: string, category: string, value: string, source?: string, unit?: string, dimensions?: Record<string, string>) {
    return db.insert(systemMetric).values({
      id: generateId("metric"), metricName, category, value, unit: unit || null, source: source || null,
      dimensions: dimensions || {},
    });
  }

  async getMetrics(metricName: string, startDate: Date, endDate: Date) {
    return db.select().from(systemMetric).where(
      and(eq(systemMetric.metricName, metricName), gte(systemMetric.recordedAt, startDate), lte(systemMetric.recordedAt, endDate))
    ).orderBy(systemMetric.recordedAt);
  }

  async getMetricSummary(startDate: Date, endDate: Date) {
    return db.select({
      category: systemMetric.category,
      count: sql<number>`count(*)`,
      avgValue: sql<number>`avg(CAST(${systemMetric.value} AS numeric))`,
    }).from(systemMetric).where(
      and(gte(systemMetric.recordedAt, startDate), lte(systemMetric.recordedAt, endDate))
    ).groupBy(systemMetric.category);
  }

  async createAlert(data: { name: string; type: string; severity?: string; condition: Record<string, unknown>; serviceName?: string; createdBy?: string }) {
    const id = generateId("alert");
    return db.insert(systemAlert).values({ ...data, id }).returning().then(r => r[0]);
  }

  async getAlerts(filters?: { type?: string; severity?: string; isActive?: boolean }) {
    const conditions = [];
    if (filters?.type) conditions.push(eq(systemAlert.type, filters.type));
    if (filters?.severity) conditions.push(eq(systemAlert.severity, filters.severity));
    if (filters?.isActive !== undefined) conditions.push(eq(systemAlert.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(systemAlert).where(where).orderBy(desc(systemAlert.createdAt));
  }

  async triggerAlert(id: string) {
    return db.update(systemAlert).set({ lastTriggeredAt: new Date(), triggerCount: sql`${systemAlert.triggerCount} + 1` }).where(eq(systemAlert.id, id));
  }

  async createIncident(data: { title: string; description?: string; severity?: string; affectedServices?: string[]; createdBy?: string }) {
    const id = generateId("incid");
    return db.insert(systemIncident).values({ ...data, id, severity: data.severity || "minor", affectedServices: data.affectedServices || [] }).returning().then(r => r[0]);
  }

  async getIncidents(filters?: { status?: string; severity?: string }) {
    const conditions = [];
    if (filters?.status) conditions.push(eq(systemIncident.status, filters.status));
    if (filters?.severity) conditions.push(eq(systemIncident.severity, filters.severity));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(systemIncident).where(where).orderBy(desc(systemIncident.createdAt));
  }

  async updateIncident(id: string, data: Record<string, unknown>) {
    return db.update(systemIncident).set({ ...data, updatedAt: new Date() }).where(eq(systemIncident.id, id)).returning().then(r => r[0]);
  }

  async getDependencies() {
    return db.select().from(systemDependency).orderBy(systemDependency.name);
  }

  async updateDependency(name: string, status: string) {
    const [existing] = await db.select().from(systemDependency).where(eq(systemDependency.name, name)).limit(1);
    if (existing) {
      return db.update(systemDependency).set({ status, updatedAt: new Date() }).where(eq(systemDependency.id, existing.id));
    }
    const id = generateId("dep");
    return db.insert(systemDependency).values({ id, name, type: "service", status });
  }

  async runFullHealthCheck(): Promise<{ total: number; healthy: number; warning: number; critical: number; offline: number }> {
    const services = [
      { name: "database", type: "database" },
      { name: "ai-runtime", type: "ai" },
      { name: "storage", type: "storage" },
      { name: "email", type: "email" },
      { name: "payment", type: "payment" },
      { name: "queue", type: "queue" },
    ];
    let healthy = 0, warning = 0, critical = 0, offline = 0;
    const results = await Promise.all(services.map(s => this.checkHealth(s.name, s.type)));
    for (const result of results) {
      if (result.status === "healthy") healthy++;
      else if (result.status === "warning") warning++;
      else if (result.status === "critical") critical++;
      else offline++;
    }
    return { total: services.length, healthy, warning, critical, offline };
  }

  async getOverviewStats() {
    return cacheGetOrSet("monitoring:stats:overview", async () => {
      const [totalAlerts, activeAlerts, openIncidents, resolvedIncidents] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(systemAlert),
        db.select({ count: sql<number>`count(*)` }).from(systemAlert).where(eq(systemAlert.isActive, true)),
        db.select({ count: sql<number>`count(*)` }).from(systemIncident).where(eq(systemIncident.status, "open")),
        db.select({ count: sql<number>`count(*)` }).from(systemIncident).where(eq(systemIncident.status, "resolved")),
      ]);
      const healthResults = await this.runFullHealthCheck();
      return {
        alerts: Number(totalAlerts?.count ?? 0), activeAlerts: Number(activeAlerts?.count ?? 0),
        openIncidents: Number(openIncidents?.count ?? 0), resolvedIncidents: Number(resolvedIncidents?.count ?? 0),
        health: healthResults,
      };
    }, 60000);
  }
}

export const monitoringEngine = new MonitoringEngine();
