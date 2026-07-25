"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

export function CTASection() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" id="contact" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background px-6 py-12 sm:px-12 sm:py-16 text-center">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {t("marketing.ctaTitle")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("marketing.ctaDescription")}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
                )}
              >
                {t("marketing.ctaPrimary")}
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                <CalendarClock className="mr-2 size-4" />
                {t("marketing.ctaSecondary")}
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{t("marketing.ctaNote")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
