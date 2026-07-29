import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { regionService } from "@/core/localization/region.service";
import { pricingRuleService } from "@/core/localization/pricing-rule.service";
import { cookies } from "next/headers";
import { logger } from "@/core/logger";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      cookieStore.get("tamer_country")?.value ||
      null;

    let profile = null;
    try {
      profile = country
        ? await regionService.getProfileByCountry(country)
        : await regionService.getDefaultProfile();
    } catch {
      profile = null;
    }

    let pricingProfile = null;
    let rules: Array<{
      planId: string;
      monthly: { displayPrice: string; amount: string; currency: string; billingCycle: string } | null;
      yearly: { displayPrice: string; amount: string; currency: string; billingCycle: string } | null;
    }> = [];

    if (profile) {
      try {
        pricingProfile = await pricingRuleService.getProfileByCode(profile.pricingProfile);
      } catch {
        pricingProfile = null;
      }

      if (pricingProfile) {
        try {
          const planIds = ["starter", "pro", "business", "enterprise"];
          rules = await Promise.all(
            planIds.map(async (planId) => {
              const rule = await pricingRuleService.getRule(pricingProfile!.id, planId, "monthly");
              const yearlyRule = rule ? await pricingRuleService.getRule(pricingProfile!.id, planId, "yearly") : null;
              return {
                planId,
                monthly: rule
                  ? { displayPrice: rule.displayPrice, amount: rule.amount, currency: rule.currency, billingCycle: rule.billingCycle }
                  : null,
                yearly: yearlyRule
                  ? { displayPrice: yearlyRule.displayPrice, amount: yearlyRule.amount, currency: yearlyRule.currency, billingCycle: yearlyRule.billingCycle }
                  : null,
              };
            })
          );
        } catch {
          rules = [];
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: pricingProfile
          ? {
              code: pricingProfile.code,
              name: pricingProfile.name,
              currency: pricingProfile.currency,
              config: pricingProfile.config,
            }
          : null,
        rules,
        source: "business-engine",
      },
    });
  } catch (error) {
    logger.error("[GET /api/landing/pricing] Error:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        success: true,
        data: {
          profile: null,
          rules: [],
          source: "fallback",
        },
      },
      { status: 200 }
    );
  }
}