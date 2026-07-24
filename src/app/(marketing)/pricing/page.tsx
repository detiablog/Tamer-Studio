"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";

export default function PricingPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("marketing.pricingTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("marketing.pricingDescription")}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {["Starter", "Pro", "Enterprise"].map((plan) => (
          <div key={plan} className="rounded-3xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">{plan}</h3>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(0)}</p>
            <p className="text-sm text-muted-foreground">{t("common.comingSoon")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
