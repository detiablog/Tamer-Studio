"use client";

import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { Mail, ArrowRight } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

export default function ForgotPasswordPage() {
  const { t } = useLocalizationContext();
  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Mail className="size-3.5" />
          {t("auth.forgotPassword.badge")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("auth.forgotPassword.title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("auth.forgotPassword.description")}
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">          {t("auth.forgotPassword.rememberPassword")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link 
          href="/login" 
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted hover:border-foreground/20 group"
        >
          {t("auth.forgotPassword.backToSignIn")}
          <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("auth.forgotPassword.needHelp")}{" "}
        <Link href="/support" className="text-primary hover:underline font-medium">
          {t("auth.login.contactSupport")}
        </Link>
      </p>
    </main>
  );
}
