import type { EmailProvider, EmailProviderHealth, ProviderStatus } from "./email.interface";
import { emailLogger } from "./email.logger";

export class EmailHealthMonitor {
  private healthMap: Map<string, EmailProviderHealth> = new Map();
  private providers: Map<string, EmailProvider> = new Map();
  private listeners: Set<(health: EmailProviderHealth) => void> = new Set();

  registerProvider(provider: EmailProvider): void {
    this.providers.set(provider.id, provider);
    this.healthMap.set(provider.id, {
      id: `health_${provider.id}`,
      providerId: provider.id,
      status: provider.isActive ? "healthy" : "disabled",
      consecutiveFailures: 0,
      checkedAt: new Date(),
    });
    emailLogger.info("Provider registered for health monitoring", { providerId: provider.id, providerType: provider.type });
  }

  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.healthMap.delete(providerId);
  }

  async checkProvider(providerId: string): Promise<EmailProviderHealth> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return {
        id: `health_${providerId}`,
        providerId,
        status: "offline",
        consecutiveFailures: 0,
        checkedAt: new Date(),
      };
    }

    const start = Date.now();
    try {
      const result = await provider.healthCheck();
      const latencyMs = Date.now() - start;
      const health: EmailProviderHealth = {
        ...result,
        latencyMs,
        checkedAt: new Date(),
      };
      this.healthMap.set(providerId, health);
      this.notifyListeners(health);
      emailLogger.debug("Health check completed", { providerId, status: health.status, latencyMs });
      return health;
    } catch (error) {
      const health: EmailProviderHealth = {
        id: `health_${providerId}`,
        providerId,
        status: "offline",
        latencyMs: Date.now() - start,
        consecutiveFailures: (this.healthMap.get(providerId)?.consecutiveFailures || 0) + 1,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorCode: "health_check_failed",
        checkedAt: new Date(),
      };
      this.healthMap.set(providerId, health);
      this.notifyListeners(health);
      emailLogger.warn("Health check failed", { providerId, error: health.errorMessage });
      return health;
    }
  }

  async checkAllProviders(): Promise<EmailProviderHealth[]> {
    const checks = Array.from(this.providers.keys()).map((id) => this.checkProvider(id));
    return Promise.all(checks);
  }

  getHealth(providerId: string): EmailProviderHealth | undefined {
    return this.healthMap.get(providerId);
  }

  getAllHealth(): EmailProviderHealth[] {
    return Array.from(this.healthMap.values());
  }

  updateProviderStatus(providerId: string, status: ProviderStatus, error?: { code?: string; message?: string }): void {
    const current = this.healthMap.get(providerId);
    if (!current) return;
    const health: EmailProviderHealth = {
      ...current,
      status,
      consecutiveFailures: status === "offline" ? current.consecutiveFailures + 1 : 0,
      errorMessage: error?.message,
      errorCode: error?.code,
      lastFailureAt: status === "offline" ? new Date() : current.lastFailureAt,
      lastSuccessAt: status === "healthy" ? new Date() : current.lastSuccessAt,
      checkedAt: new Date(),
    };
    this.healthMap.set(providerId, health);
    this.notifyListeners(health);
  }

  resetConsecutiveFailures(providerId: string): void {
    const current = this.healthMap.get(providerId);
    if (!current) return;
    const health: EmailProviderHealth = {
      ...current,
      consecutiveFailures: 0,
      status: "healthy",
      checkedAt: new Date(),
    };
    this.healthMap.set(providerId, health);
    this.notifyListeners(health);
  }

  onHealthChange(listener: (health: EmailProviderHealth) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(health: EmailProviderHealth): void {
    this.listeners.forEach((listener) => {
      try {
        listener(health);
      } catch (error) {
        emailLogger.error("Health listener failed", error as Error, { providerId: health.providerId });
      }
    });
  }
}

export const emailHealthMonitor = new EmailHealthMonitor();
