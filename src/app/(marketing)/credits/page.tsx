"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { CreditCalculator } from "@/components/landing/CreditCalculator";
import { CreditUsageTable } from "@/components/landing/CreditUsageTable";
import Link from "next/link";

export default function CreditsPage() {
  const { t } = useLocalizationContext();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("marketing.creditPackTitle")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t("marketing.pricingDescription")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("marketing.creditPackDescription")}
        </p>
      </div>
      <CreditCalculator />
      <CreditUsageTable />
      <div className="mx-auto max-w-2xl text-center mt-12">
        <p className="text-sm text-muted-foreground">
          Want to see all plans?{" "}
          <Link href="/pricing" className="text-primary hover:underline">
            View pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
