import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { pricingProfile, pricingRule } from "@/lib/db/schema/localization";
import type { PricingRuleInfo, PricingProfileInfo } from "@/lib/localization/types";

export interface CheckoutPricingResolution {
  profile: PricingProfileInfo | null;
  rule: PricingRuleInfo | null;
}

export class PricingRuleService {
  async getProfileByCode(code: string): Promise<PricingProfileInfo | null> {
    const [row] = await db
      .select()
      .from(pricingProfile)
      .where(and(eq(pricingProfile.code, code), eq(pricingProfile.isEnabled, true)))
      .limit(1);

    if (!row) return null;
    return {
      ...row,
      config: row.config ?? {},
    } as PricingProfileInfo;
  }

  async getRule(profileId: string, planId: string, billingCycle = "monthly"): Promise<PricingRuleInfo | null> {
    const [row] = await db
      .select()
      .from(pricingRule)
      .where(
        and(
          eq(pricingRule.profileId, profileId),
          eq(pricingRule.planId, planId),
          eq(pricingRule.billingCycle, billingCycle),
          eq(pricingRule.isVisible, true)
        )
      )
      .limit(1);

    if (!row) return null;
    return row as PricingRuleInfo;
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
