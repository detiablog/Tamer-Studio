import { DefaultLocalizationRepository } from "./localization.repository";
import type { LocalizationRepository } from "./localization.repository";
import type { PricingRuleInfo, PricingProfileInfo } from "@/lib/localization/types";

export interface CheckoutPricingResolution {
  profile: PricingProfileInfo | null;
  rule: PricingRuleInfo | null;
}

export class PricingRuleService {
  private repository: LocalizationRepository;

  constructor(repository?: LocalizationRepository) {
    this.repository = repository ?? new DefaultLocalizationRepository();
  }

  async getProfileByCode(code: string): Promise<PricingProfileInfo | null> {
    const profiles = await this.repository.getPricingProfiles();
    return profiles.find((p) => p.code === code && p.isEnabled) ?? null;
  }

  async getRule(profileId: string, planId: string, billingCycle = "monthly"): Promise<PricingRuleInfo | null> {
    const rules = await this.repository.getPricingRules(profileId);
    return rules.find(
      (r) => r.planId === planId && r.billingCycle === billingCycle && r.isVisible
    ) ?? null;
  }

  async resolveForCheckout(profileCode: string | null | undefined, planId?: string, billingCycle = "monthly"): Promise<CheckoutPricingResolution> {
    if (!profileCode) {
      return { profile: null, rule: null };
    }

    const profile = await this.getProfileByCode(profileCode);
    if (!profile) {
      return { profile: null, rule: null };
    }

    const rule = planId ? await this.getRule(profile.id, planId, billingCycle) : null;

    return {
      profile,
      rule,
    };
  }
}

export const pricingRuleService = new PricingRuleService();