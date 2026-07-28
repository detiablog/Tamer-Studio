"use client";

import { useLocalizationContext } from "@/providers/localization";

export function AboutContent() {
  const { t } = useLocalizationContext();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.aboutTitle")}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-7">
            {t("marketing.aboutContent1")}
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-7">
            {t("marketing.aboutContent2")}
          </p>
        </div>
      </div>
    </div>
  );
}
