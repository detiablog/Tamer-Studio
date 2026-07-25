"use client";

import { FAQ } from "@/components/landing/FAQ";
import { useLocalizationContext } from "@/providers/localization";

export default function FAQPage() {
  const { t } = useLocalizationContext();
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("marketing.faqTitle")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {t("marketing.faqDescription")}
        </p>
      </div>
      <FAQ />
    </div>
  );
}
