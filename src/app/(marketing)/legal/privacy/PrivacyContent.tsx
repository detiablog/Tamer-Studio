"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";

export function PrivacyContent() {
  const { t } = useLocalizationContext();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.privacy.title", "Privacy Policy")}</h1>
          <p className="mt-4 text-base text-muted-foreground leading-7">
            {t("marketing.privacy.intro", "Your privacy is important to us. This policy explains how Tamer Studio collects, uses, and protects your data.")}
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-7">
            {t("marketing.privacy.collection", "We collect only the information necessary to provide and improve our services. We do not sell your personal data to third parties.")}
          </p>
        </div>
      </div>
    </div>
  );
}
