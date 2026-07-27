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

export default function PricingPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const { sections } = useLandingSections();
  const pricingSection = sections.find((s) => s.sectionKey === "pricing");
  const faqSection = sections.find((s) => s.sectionKey === "faq");
  const calculatorSection = sections.find((s) => s.sectionKey === "credit-calculator");
  const usageSection = sections.find((s) => s.sectionKey === "credit-usage");
  const creditPacksSection = sections.find((s) => s.sectionKey === "credit-packs");

  return (
    <div className="w-full">
      {pricingSection && <PricingSection section={pricingSection} />}
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
