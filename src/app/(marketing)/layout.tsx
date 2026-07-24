"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLocalizationContext();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">TS</div>
            Tamer Studio
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">{t("common.pricing")}</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground">{t("common.about")}</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">{t("common.contact")}</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">{t("common.signIn")}</Link>
            <Link href="/register" className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">{t("common.getStarted")}</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-20">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("marketing.footerTagline")}</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/legal/privacy" className="hover:text-foreground">{t("common.privacy")}</Link>
            <Link href="/legal/terms" className="hover:text-foreground">{t("common.terms")}</Link>
            <Link href="/docs" className="hover:text-foreground">{t("common.docs")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
