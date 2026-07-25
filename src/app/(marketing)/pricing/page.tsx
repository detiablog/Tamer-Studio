"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQ } from "@/components/landing/FAQ";
import { CreditCalculator } from "@/components/landing/CreditCalculator";
import { CreditUsageTable } from "@/components/landing/CreditUsageTable";
import { cn } from "@/lib/utils";
import { useLandingSections } from "@/hooks/use-landing-sections";

const creditPacks = [
  { key: "marketing.creditPackSmall", credits: 100, price: "$9" },
  { key: "marketing.creditPackMedium", credits: 500, price: "$39" },
  { key: "marketing.creditPackLarge", credits: 2000, price: "$149" },
  { key: "marketing.creditPackCustom", credits: null, price: null },
];

export default function PricingPage() {
  const { t } = useLocalizationContext();
  const { sections } = useLandingSections();
  const pricingSection = sections.find((s) => s.sectionKey === "pricing");
  const faqSection = sections.find((s) => s.sectionKey === "faq");
  const calculatorSection = sections.find((s) => s.sectionKey === "credit-calculator");
  const usageSection = sections.find((s) => s.sectionKey === "credit-usage");

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
          {creditPacks.map((pack) => (
            <div
              key={pack.key}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold">{t(pack.key)}</h3>
              {pack.credits ? (
                <>
                  <p className="mt-2 text-3xl font-semibold">{pack.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {pack.credits} {t("marketing.credits")}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("marketing.contactSales")}
                </p>
              )}
              <Link
                href="/register"
                className={cn(
                  "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
                  "border border-border bg-background hover:bg-muted"
                )}
              >
                {t("marketing.buyNow")}
              </Link>
            </div>
          ))}
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
