export interface SystemConfig {
  platform: PlatformConfig;
  environment: EnvironmentConfig;
  services: ServiceRegistryEntry[];
  modules: ModuleHealth[];
  configValidation: ConfigValidationResult;
}

export interface PlatformConfig {
  platformName: string;
  version: string;
  environment: string;
  region: string;
  maintenanceMode: boolean;
  readOnlyMode: boolean;
  registrationOpen: boolean;
  maxUploadSize: number;
  rateLimitPerMinute: number;
}

export interface EnvironmentConfig {
  nodeEnv: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseConnected: boolean;
  redisConnected: boolean;
}

export interface ServiceRegistryEntry {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  lastChecked: Date;
  responseTime: number;
  errorMessage?: string;
  version?: string;
}

export interface ModuleHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  initialized: boolean;
  errorMessage?: string;
  lastHealthCheck: Date;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  key: string;
  message: string;
  severity: "error";
}

export interface ConfigValidationWarning {
  key: string;
  message: string;
  severity: "warning";
}

export interface RuntimeInfo {
  pid: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeHandles: number;
  activeRequests: number;
  eventLoopLag: number;
}
