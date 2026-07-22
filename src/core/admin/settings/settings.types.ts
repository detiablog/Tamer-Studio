export interface GlobalSettings {
  platformName: string;
  supportEmail: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
  readOnlyMode: boolean;
  defaultLanguage: string;
  defaultTimezone: string;
  maxUploadSize: number;
  allowedFileTypes: string[];
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
}

export interface AIConfiguration {
  defaultProvider: string;
  defaultModel: string;
  maxTokensPerRequest: number;
  maxConcurrentRequests: number;
  timeoutMs: number;
  retryAttempts: number;
  fallbackEnabled: boolean;
  costCeiling: number;
  currency: string;
}

export interface BillingConfiguration {
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  creditToCurrencyRate: Record<string, number>;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
  gracePeriodDays: number;
}

export interface SecurityPolicies {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecialChar: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  mfaEnabled: boolean;
  ipWhitelistEnabled: boolean;
  allowedIpRanges: string[];
}

export interface RateLimits {
  apiKeyRateLimitPerMinute: number;
  userRateLimitPerMinute: number;
  workspaceRateLimitPerMinute: number;
  anonymousRateLimitPerMinute: number;
}

export interface UploadSettings {
  maxFileSize: number;
  allowedMimeTypes: string[];
  maxFilesPerUpload: number;
  virusScanEnabled: boolean;
}

export type SettingsCategory = "global" | "ai" | "billing" | "security" | "rateLimits" | "upload";
