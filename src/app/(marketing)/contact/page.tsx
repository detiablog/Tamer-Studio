"use client";

import { useLocalizationContext } from "@/providers/localization";

export default function ContactPage() {
  const { t } = useLocalizationContext();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("common.contact")}</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          {t("marketing.contactDescription")}
        </p>
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">{t("marketing.contactEmail")}</label>
            <p className="text-sm text-muted-foreground">support@tamer.studio</p>
          </div>
          <div>
            <label className="text-sm font-medium">{t("marketing.contactSupport")}</label>
            <p className="text-sm text-muted-foreground">{t("marketing.contactSupportHours")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
