import type { EmailProvider, EmailRouter, EmailType, RoutingMode } from "./email.interface";
import { emailLogger } from "./email.logger";

export class DefaultEmailRouter implements EmailRouter {
  private providers: Map<string, EmailProvider> = new Map();
  private routingMode: RoutingMode = "priority";
  private roundRobinIndex: Map<EmailType, number> = new Map();
  private manualProviderId: string | null = null;

  registerProvider(provider: EmailProvider): void {
    this.providers.set(provider.id, provider);
    emailLogger.info("Provider registered to router", { providerId: provider.id, providerType: provider.type });
  }

  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }

  setRoutingMode(mode: RoutingMode): void {
    this.routingMode = mode;
    emailLogger.info("Routing mode changed", { mode });
  }

  getRoutingMode(): RoutingMode {
    return this.routingMode;
  }

  setManualProvider(providerId: string | null): void {
    this.manualProviderId = providerId;
  }

  getProvider(messageType: EmailType): EmailProvider | null {
    if (this.routingMode === "manual" && this.manualProviderId) {
      return this.providers.get(this.manualProviderId) || null;
    }

    if (this.routingMode === "priority") {
      return this.getPriorityProvider();
    }

    if (this.routingMode === "failover") {
      return this.getFailoverProvider();
    }

    if (this.routingMode === "round_robin") {
      return this.getRoundRobinProvider(messageType);
    }

    return this.getPriorityProvider();
  }

  getAllProviders(): EmailProvider[] {
    return Array.from(this.providers.values());
  }

  getActiveProviders(): EmailProvider[] {
    return this.getAllProviders().filter((p) => p.isActive && p.status !== "disabled");
  }

  updateProviderPriority(providerId: string, priority: number): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      emailLogger.info("Provider priority updated", { providerId, priority });
    }
  }

  toggleProvider(providerId: string, active: boolean): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      emailLogger.info("Provider toggled", { providerId, active });
    }
  }

  async reload(): Promise<void> {
    emailLogger.info("Router reloaded", { providerCount: this.providers.size, routingMode: this.routingMode });
  }

  private getPriorityProvider(): EmailProvider | null {
    const active = this.getActiveProviders();
    if (active.length === 0) return null;
    active.sort((a, b) => a.priority - b.priority);
    return active[0];
  }

  private getFailoverProvider(): EmailProvider | null {
    const active = this.getActiveProviders();
    if (active.length === 0) return null;
    for (const provider of active) {
      const status = provider.status;
      if (status === "healthy" || status === "warning") {
        return provider;
      }
    }
    return active[0];
  }

  private getRoundRobinProvider(messageType: EmailType): EmailProvider | null {
    const active = this.getActiveProviders();
    if (active.length === 0) return null;
    const currentIndex = this.roundRobinIndex.get(messageType) || 0;
    const nextIndex = currentIndex % active.length;
    this.roundRobinIndex.set(messageType, nextIndex + 1);
    return active[nextIndex];
  }
}

export const defaultEmailRouter = new DefaultEmailRouter();
