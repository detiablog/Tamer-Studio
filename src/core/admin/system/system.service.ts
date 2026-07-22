import type { SystemConfig, RuntimeInfo } from "./system.types";
import { MaintenanceService } from "../maintenance";
import { SettingsService } from "../settings";
import os from "os";

export class SystemService {
  private maintenanceService = new MaintenanceService();
  private settingsService = new SettingsService();

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
