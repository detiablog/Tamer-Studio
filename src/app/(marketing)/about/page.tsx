"use client";

import { useLocalizationContext } from "@/providers/localization";

export default function AboutPage() {
  const { t } = useLocalizationContext();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("marketing.aboutTitle")}</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          {t("marketing.aboutContent1")}
        </p>
        <p className="mt-4 text-muted-foreground leading-7">
          {t("marketing.aboutContent2")}
        </p>
      </div>
    </div>
  );
}
