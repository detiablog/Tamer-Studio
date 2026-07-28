"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";

export function TermsContent() {
  const { t } = useLocalizationContext();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.terms.title", "Terms of Service")}</h1>
          <p className="mt-4 text-base text-muted-foreground leading-7">
            {t("marketing.terms.intro", "By using Tamer Studio, you agree to these terms. Please read them carefully.")}
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-7">
            {t("marketing.terms.responsibility", "You are responsible for the content you generate and the AI providers you connect. Tamer Studio is a production operating system and does not guarantee specific outcomes from AI models.")}
          </p>
        </div>
      </div>
    </div>
  );
}
