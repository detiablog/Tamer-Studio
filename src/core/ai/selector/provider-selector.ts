import type { AIRequest } from "../types/domain";
import type { AIProvider } from "@/core/admin/providers/providers.types";
import type { ProviderRegistry } from "../registry/provider-registry";
import type { SelectionScore, SelectionPolicy } from "./selector.types";
import { logger } from "@/core/logger";
import { logAction } from "@/core/audit";

export interface ProviderSelector {
  select(request: AIRequest, policy?: SelectionPolicy): Promise<string | undefined>;
  rankProviders(request: AIRequest, candidates: AIProvider[]): SelectionScore[];
}

export class DefaultProviderSelector implements ProviderSelector {
  constructor(private providerRegistry: ProviderRegistry) {}

  async select(request: AIRequest, policy?: SelectionPolicy): Promise<string | undefined> {
    const candidates = await this.providerRegistry.getByCapability(request.capability);

    if (!candidates.length) {
      return undefined;
    }

    let filtered = candidates;

    if (policy?.excludedProviders?.length) {
      filtered = filtered.filter((p) => !policy.excludedProviders!.includes(p.id));
    }

    if (policy?.minHealthStatus) {
      const statusOrder = { healthy: 3, degraded: 2, unhealthy: 1, unknown: 0 } as const;
      const minStatus = statusOrder[policy.minHealthStatus] ?? 0;
      filtered = filtered.filter(
        (p) => (statusOrder[p.health.status] ?? 3) >= minStatus
      );
    }

    if (policy?.maxLatencyMs !== undefined) {
      filtered = filtered.filter(
        (p) => (p.health.latencyMs ?? Infinity) <= policy.maxLatencyMs!
      );
    }

type ProviderRegionMetadata = {
  metadata?: {
    region?: string;
  };
};

    if (policy?.region) {
      filtered = filtered.filter(
        (p) => (p as ProviderRegionMetadata).metadata?.region === policy.region
      );
    }

    if (policy?.preferredProviders?.length) {
      const preferred = filtered.filter((p) => policy.preferredProviders!.includes(p.id));
      if (preferred.length > 0) {
        filtered = preferred;
      }
    }

    const ranked = this.rankProviders(request, filtered);

    if (!ranked.length) {
      return undefined;
    }

    const top = ranked[0];
    logger.debug("Provider selected", {
      requestId: request.id,
      providerId: top.providerId,
      score: top.score,
      reasons: top.reasons,
    });

    logAction("provider.execution.started", undefined, "system", {
      requestId: request.id,
      providerId: top.providerId,
      score: top.score,
      reasons: top.reasons,
      traceId: (request.context.metadata?.traceId as string | undefined),
      spanId: (request.context.metadata?.spanId as string | undefined),
    });

    return top.providerId;
  }

  rankProviders(request: AIRequest, candidates: AIProvider[]): SelectionScore[] {
    return candidates.map((provider) => {
      let score = 0;
      const reasons: string[] = [];

      const hasCapability = provider.capabilities.some(
        (c) => c === request.capability
      );
      if (hasCapability) {
        score += 100;
        reasons.push("capability_match");
      }

      const health = provider.health;
      if (health.status === "healthy") {
        score += 50;
        reasons.push("healthy");
      } else if (health.status === "degraded") {
        score += 25;
        reasons.push("degraded");
      }

      const latency = health.latencyMs ?? Infinity;
      if (latency <= 200) {
        score += 30;
        reasons.push("low_latency");
      } else if (latency <= 500) {
        score += 20;
        reasons.push("medium_latency");
      } else if (latency <= 1000) {
        score += 10;
        reasons.push("higher_latency");
      }

      const estimatedCost = this.estimateCost(provider);
      if (estimatedCost <= 0.001) {
        score += 20;
        reasons.push("low_cost");
      } else if (estimatedCost <= 0.005) {
        score += 15;
        reasons.push("medium_cost");
      } else if (estimatedCost <= 0.01) {
        score += 10;
        reasons.push("higher_cost");
      }

      return { providerId: provider.id, score, reasons };
    }).sort((a, b) => b.score - a.score);
  }

  private estimateCost(provider: AIProvider): number {
    if (provider.costConfiguration?.inputPricePerToken) {
      return provider.costConfiguration.inputPricePerToken;
    }
    return 0.001;
  }
}
