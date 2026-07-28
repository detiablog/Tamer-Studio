"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { PricingSection } from "@/components/landing/PricingSection";
import { CreditPacks } from "@/components/landing/CreditPacks";
import { FAQ } from "@/components/landing/FAQ";
import { CreditCalculator } from "@/components/landing/CreditCalculator";
import { CreditUsageTable } from "@/components/landing/CreditUsageTable";
import { cn } from "@/lib/utils";
import { useLandingSections } from "@/hooks/use-landing-sections";
import type { PlanWithPricing } from "@/core/commerce";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });

export function PricingContent() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const { sections } = useLandingSections();
  const pricingSection = sections.find((s) => s.sectionKey === "pricing");
  const faqSection = sections.find((s) => s.sectionKey === "faq");
  const calculatorSection = sections.find((s) => s.sectionKey === "credit-calculator");
  const usageSection = sections.find((s) => s.sectionKey === "credit-usage");
  const creditPacksSection = sections.find((s) => s.sectionKey === "credit-packs");

  const [commercePlans, setCommercePlans] = React.useState<PlanWithPricing[]>([]);
  const [plansLoading, setPlansLoading] = React.useState(true);

  React.useEffect(() => {
    fetcher("/api/commerce/plans")
      .then((res) => {
        if (res.success && res.data) {
          setCommercePlans(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <div className="w-full">
      {pricingSection && <PricingSection section={pricingSection} />}

      {commercePlans.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("commerce.choosePlan", "Choose your plan")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("marketing.pricingDescription")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {commercePlans.map((plan) => {
              const monthlyPricing = plan.pricings.find(
                (p) => p.billingOption.frequency === "monthly" && p.isActive
              );
              const yearlyPricing = plan.pricings.find(
                (p) => p.billingOption.frequency === "yearly" && p.isActive
              );
              const activePricing = monthlyPricing || yearlyPricing || plan.pricings[0];

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
                    plan.badge === "popular" && "border-primary ring-2 ring-primary/20"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {plan.badge === "popular"
                        ? t("commerce.popular", "Popular")
                        : plan.badge === "best_value"
                          ? t("commerce.bestValue", "Best Value")
                          : plan.badge}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  )}

                  {activePricing && (
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatCurrency(activePricing.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {activePricing.billingOption.frequency === "monthly"
                          ? t("commerce.perMonth", "/month")
                          : activePricing.billingOption.frequency === "yearly"
                            ? t("commerce.perYear", "/year")
                            : ""}
                      </span>
                    </div>
                  )}

                  {activePricing && activePricing.creditsIncluded > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activePricing.creditsIncluded.toLocaleString()} {t("commerce.creditsIncluded", "credits included")}
                    </p>
                  )}

                  <ul className="mt-6 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 text-green-500">&#10003;</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t("commerce.storage", "Storage")}</span>
                      <span>{plan.storageLimitMb} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("commerce.projects", "Projects")}</span>
                      <span>{plan.projectLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("commerce.workspaces", "Workspaces")}</span>
                      <span>{plan.workspaceLimit}</span>
                    </div>
                  </div>

                  <Link
                    href={`/pricing?plan=${plan.slug}`}
                    className="mt-6 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {t("commerce.subscribe", "Subscribe")}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!plansLoading && commercePlans.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("commerce.choosePlan", "Choose your plan")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("marketing.pricingDescription")}
            </p>
          </div>
          <div className="mt-12 text-center text-muted-foreground">
            {t("commerce.plans", "Plans")} — {t("common.comingSoon", "Coming soon")}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("marketing.creditPackTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("marketing.creditPackDescription")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {creditPacksSection ? (
            <CreditPacks section={creditPacksSection} />
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                {t("marketing.noCreditPacks", "No credit packs configured yet.")}
              </p>
            </div>
          )}
        </div>

        <div className="mt-12">
          {calculatorSection && <CreditCalculator section={calculatorSection} />}
        </div>

        <div className="mt-12">
          {usageSection && <CreditUsageTable section={usageSection} />}
        </div>

        <div className="mt-12 mx-auto max-w-2xl">
          {faqSection && <FAQ section={faqSection} />}
        </div>
      </div>
    </div>
  );
}
