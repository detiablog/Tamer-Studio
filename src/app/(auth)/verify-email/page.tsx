"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useLocalizationContext } from "@/providers/localization";

export default function VerifyEmailPage() {
  const { t } = useLocalizationContext();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t("auth.verifyEmail.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.verifyEmail.description")}</p>
      </div>
      <EmptyState title={t("auth.verifyEmail.comingSoon")} description={t("auth.verifyEmail.comingSoonDescription")} />
    </div>
  );
}
