import type { GatewayId, GatewayPolicy, GatewayRetryRule } from "./types";

export interface GatewayPolicyEngine {
  resolvePrimaryGateway(policy: GatewayPolicy): GatewayId;
  resolveFallbackGateway(policy: GatewayPolicy): GatewayId | undefined;
  resolveGatewayForCapability(capabilityId: string, policy: GatewayPolicy): GatewayId | undefined;
  resolveTimeout(capabilityId: string, gatewayId: string, policy: GatewayPolicy): number;
  resolveRetryRule(capabilityId: string, gatewayId: string, policy: GatewayPolicy): GatewayRetryRule;
  resolveWorkspaceOverride(workspaceId: string, policy: GatewayPolicy): Partial<GatewayPolicy> | undefined;
  isFeatureEnabled(flag: string, policy: GatewayPolicy): boolean;
  shouldRetry(attempt: number, rule: GatewayRetryRule): boolean;
}

export class DefaultGatewayPolicyEngine implements GatewayPolicyEngine {
  resolvePrimaryGateway(policy: GatewayPolicy): GatewayId {
    return policy.primaryGatewayId;
  }

  resolveFallbackGateway(policy: GatewayPolicy): GatewayId | undefined {
    return policy.fallbackGatewayId;
  }

  resolveGatewayForCapability(capabilityId: string, policy: GatewayPolicy): GatewayId | undefined {
    return policy.capabilityRouting[capabilityId];
  }

  resolveTimeout(capabilityId: string, _gatewayId: string, policy: GatewayPolicy): number {
    const rule = policy.timeoutRules.find((item) => item.capabilityId === capabilityId);
    if (rule) return rule.durationMs;
    return 30000;
  }

  resolveRetryRule(_capabilityId: string, _gatewayId: string, policy: GatewayPolicy): GatewayRetryRule {
    const rule = policy.retryRules[0];
    if (rule) return rule;
    return { maxAttempts: 0, backoffMs: 1000, retryableStatuses: [] };
  }

  resolveWorkspaceOverride(workspaceId: string, policy: GatewayPolicy): Partial<GatewayPolicy> | undefined {
    return policy.workspaceOverrides[workspaceId];
  }

  isFeatureEnabled(flag: string, policy: GatewayPolicy): boolean {
    return policy.featureFlags[flag] ?? false;
  }

  shouldRetry(attempt: number, rule: GatewayRetryRule): boolean {
    return attempt < rule.maxAttempts;
  }
}
