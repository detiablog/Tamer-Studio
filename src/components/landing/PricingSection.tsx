"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Zap } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useLandingData } from "@/hooks/use-landing-data";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface Plan {
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  includedCreditsMonthly: number;
  includedCreditsYearly: number;
  description: string;
  features: string[];
  cta?: string;
  href?: string;
  popular?: boolean;
  topUp?: boolean;
  campaignBadge?: string;
}

export function PricingSection({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();
  const { formatPrice, currency, pricingRules } = useLandingData();
  const [yearly, setYearly] = React.useState(false);

  const heading = (section.config.heading as string) || section.title || t("marketing.pricingTitle");
  const description = (section.config.description as string) || section.description || t("marketing.pricingDescription");
  const plans = (section.config.plans as Plan[]) || [];

  const getCtaText = (ctaKey?: string) => {
    if (ctaKey === "marketing.getStarted") return t("marketing.getStarted");
    if (ctaKey === "marketing.contactSales") return t("marketing.contactSales");
    if (ctaKey) return t(ctaKey);
    return t("marketing.getStarted");
  };

  const getPlanPrice = (plan: Plan) => {
    if (pricingRules && pricingRules.length > 0) {
      const rule = pricingRules.find((r) => r.planId === plan.name);
      if (rule) {
        const cyclePrice = yearly ? rule.yearly : rule.monthly;
        if (cyclePrice) {
          const parsed = parseFloat(cyclePrice.displayPrice);
          if (!isNaN(parsed)) return parsed;
        }
      }
    }
    return yearly ? plan.priceYearly : plan.priceMonthly;
  };

  return (
    <section className="border-t border-border" id="pricing" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">{description}</p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
                !yearly
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("marketing.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
                yearly
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("marketing.yearly")}
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                yearly
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-green-500/20 text-green-600"
              )}>
                {t("marketing.save20", "Save 20%")}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 auto-rows-max">
          {plans.map((plan, idx) => {
            const price = getPlanPrice(plan);
            const credits = yearly ? plan.includedCreditsYearly : plan.includedCreditsMonthly;

            return (
              <div
                key={String(plan.name || "") + idx}
                className={cn(
                  "relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-foreground/10 flex flex-col h-full",
                  plan.popular && "ring-2 ring-primary scale-105 lg:scale-100 shadow-xl"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                    {t("marketing.mostPopular")}
                  </span>
                )}
                {plan.campaignBadge && (
                  <span className="absolute -top-3 right-3 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-600">
                    {plan.campaignBadge}
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>

                {plan.priceMonthly !== null && plan.priceYearly !== null ? (
                  <>
                    <p className="mt-2 text-3xl font-bold">{formatPrice(price)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {yearly ? t("marketing.billedYearly") : t("marketing.billedMonthly")}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-3xl font-bold">{formatPrice(price)}</p>
                )}

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs font-semibold w-fit">
                  <Zap className="size-3.5 text-primary" />
                  <span>{credits.toLocaleString("en-US")} {t("marketing.creditsPerMonth")}</span>
                </div>

                {plan.topUp && (
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {t("marketing.topUpAnytime")}
                    </span>
                  </div>
                )}

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-grow">{plan.description}</p>

                <ul className="mt-6 space-y-3 flex-grow">
                  {plan.features.map((feature, fidx) => (
                    <li key={String(feature || "") + fidx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="size-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{fidx === 0 ? t("marketing.platformAccess") : feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={(plan.href || "/register") as any}
                  className={cn(
                    "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition duration-200 group",
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:scale-105"
                      : "border border-border bg-background hover:bg-muted hover:border-foreground/20"
                  )}
                >
                  {getCtaText(plan.cta)}
                  {plan.cta === "marketing.getStarted" && <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground leading-relaxed">
          {t("marketing.billingNote")}
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 group"
          >
            {t("marketing.viewDetailedComparison", "View Detailed Comparison")}
            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </section>
  );
}
