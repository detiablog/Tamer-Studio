import type {
  GlobalSettings,
  AIConfiguration,
  BillingConfiguration,
  SecurityPolicies,
  RateLimits,
  UploadSettings,
  SettingsCategory,
} from "./settings.types";
import { logger } from "@/core/logger";

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  platformName: "Tamer Studio",
  supportEmail: "support@tamerstudio.com",
  registrationOpen: true,
  maintenanceMode: false,
  readOnlyMode: false,
  defaultLanguage: "en",
  defaultTimezone: "UTC",
  maxUploadSize: 50 * 1024 * 1024,
  allowedFileTypes: ["jpg", "jpeg", "png", "gif", "pdf", "mp4", "mp3"],
  rateLimitPerMinute: 100,
  rateLimitPerHour: 1000,
};

const DEFAULT_AI_CONFIG: AIConfiguration = {
  defaultProvider: "openai",
  defaultModel: "gpt-4",
  maxTokensPerRequest: 4096,
  maxConcurrentRequests: 10,
  timeoutMs: 60000,
  retryAttempts: 3,
  fallbackEnabled: true,
  costCeiling: 10,
  currency: "USD",
};

const DEFAULT_BILLING_CONFIG: BillingConfiguration = {
  currency: "USD",
  taxRate: 0,
  invoicePrefix: "INV-",
  creditToCurrencyRate: { USD: 100, EUR: 110, GBP: 125 },
  autoTopupEnabled: false,
  autoTopupThreshold: 100,
  autoTopupAmount: 500,
  gracePeriodDays: 7,
};

const DEFAULT_SECURITY_POLICIES: SecurityPolicies = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecialChar: true,
  sessionTimeoutMinutes: 1440,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  mfaEnabled: false,
  ipWhitelistEnabled: false,
  allowedIpRanges: [],
};

const DEFAULT_RATE_LIMITS: RateLimits = {
  apiKeyRateLimitPerMinute: 200,
  userRateLimitPerMinute: 100,
  workspaceRateLimitPerMinute: 500,
  anonymousRateLimitPerMinute: 20,
};

type Settings = {
  global: GlobalSettings;
  ai: AIConfiguration;
  billing: BillingConfiguration;
  security: SecurityPolicies;
  rateLimits: RateLimits;
  upload: UploadSettings;
};

const DEFAULT_UPLOAD_SETTINGS: UploadSettings = {
  maxFileSize: 50 * 1024 * 1024,
  allowedMimeTypes: ["image/*", "video/*", "audio/*", "application/pdf"],
  maxFilesPerUpload: 10,
  virusScanEnabled: true,
};

let settingsCache: Settings = {
  global: DEFAULT_GLOBAL_SETTINGS,
  ai: DEFAULT_AI_CONFIG,
  billing: DEFAULT_BILLING_CONFIG,
  security: DEFAULT_SECURITY_POLICIES,
  rateLimits: DEFAULT_RATE_LIMITS,
  upload: DEFAULT_UPLOAD_SETTINGS,
};

export class SettingsService {
  async getSettings(category?: SettingsCategory): Promise<Partial<Settings>> {
    if (!category) {
      return { ...settingsCache };
    }
    return { [category]: settingsCache[category as keyof Settings] };
  }

  async updateSettings(category: SettingsCategory, data: Partial<Settings[SettingsCategory]>): Promise<Settings> {
    const current = settingsCache[category as keyof Settings];
    const updated = { ...current, ...data };
    settingsCache = { ...settingsCache, [category]: updated };
    logger.info("Settings updated", { category, updatedKeys: Object.keys(data) });
    return settingsCache;
  }

  async getGlobalSettings(): Promise<GlobalSettings> {
    return settingsCache.global;
  }

  async updateGlobalSettings(data: Partial<GlobalSettings>): Promise<GlobalSettings> {
    const updated = await this.updateSettings("global", data);
    return updated.global;
  }

  async getAIConfiguration(): Promise<AIConfiguration> {
    return settingsCache.ai;
  }

  async updateAIConfiguration(data: Partial<AIConfiguration>): Promise<AIConfiguration> {
    const updated = await this.updateSettings("ai", data);
    return updated.ai;
  }

  async getBillingConfiguration(): Promise<BillingConfiguration> {
    return settingsCache.billing;
  }

  async updateBillingConfiguration(data: Partial<BillingConfiguration>): Promise<BillingConfiguration> {
    const updated = await this.updateSettings("billing", data);
    return updated.billing;
  }

  async getSecurityPolicies(): Promise<SecurityPolicies> {
    return settingsCache.security;
  }

  async updateSecurityPolicies(data: Partial<SecurityPolicies>): Promise<SecurityPolicies> {
    const updated = await this.updateSettings("security", data);
    return updated.security;
  }

  async getRateLimits(): Promise<RateLimits> {
    return settingsCache.rateLimits;
  }

  async updateRateLimits(data: Partial<RateLimits>): Promise<RateLimits> {
    const updated = await this.updateSettings("rateLimits", data);
    return updated.rateLimits;
  }

  async getUploadSettings(): Promise<UploadSettings> {
    return settingsCache.upload;
  }

  async updateUploadSettings(data: Partial<UploadSettings>): Promise<UploadSettings> {
    const updated = await this.updateSettings("upload", data);
    return updated.upload;
  }
}
