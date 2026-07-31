"use client";

import { ShieldCheck } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { TwoFactorClient } from "./pageClient";

export default function TwoFactorPage() {
  const { t } = useLocalizationContext();

  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="size-3.5" />
          {t("auth.2fa.badge", "Two-Factor Authentication")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("auth.2fa.title", "Verify Your Identity")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("auth.2fa.description", "Enter the 6-digit code from your authenticator app to continue.")}
        </p>
      </div>

      <TwoFactorClient />

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        {t("auth.2fa.noAccess", "Lost access to your authenticator?")}{" "}
        <button
          type="button"
          className="text-primary hover:underline font-medium"
          onClick={() => {
            const input = document.getElementById("two-factor-code") as HTMLInputElement;
            if (input) input.focus();
          }}
        >
          {t("auth.2fa.useRecoveryCode", "Use a recovery code")}
        </button>
      </p>
    </main>
  );
}
