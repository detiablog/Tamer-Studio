"use client";

import * as React from "react"
import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useLocalizationContext } from "@/providers/localization"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLocalizationContext();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
              aria-label={t("auth.layout.backToHomeAria", "Back to home")}
            >
              <ArrowLeft className="size-4" />
              {t("auth.layout.backToHome", "Back to Home")}
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <span className="text-xs font-bold">TS</span>
              </div>
              <span className="hidden sm:inline text-sm font-semibold">Tamer Studio</span>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Link href="/legal/privacy" className="transition hover:text-primary">{t("auth.layout.privacy", "Privacy")}</Link>
            <span className="text-muted-foreground/40">•</span>
            <Link href="/legal/terms" className="transition hover:text-primary">{t("auth.layout.terms", "Terms")}</Link>
            <span className="text-muted-foreground/40">•</span>
            <Link href="/support" className="transition hover:text-primary">{t("auth.layout.support", "Support")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
