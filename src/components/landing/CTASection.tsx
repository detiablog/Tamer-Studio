"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

// Landing-page specific translations (isolated from global translations)
const LANDING_PAGE_TRANSLATIONS = {
  getStartedButton: "Get Started Free",
  scheduleDemo: "Schedule Demo",
} as const;

export function CTASection() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" id="contact" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-primary/5 to-background px-6 py-16 sm:px-12 sm:py-20 text-center">
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
              <Sparkles className="size-4" />
              Ready to Transform Your Workflow?
            </div>

            <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t("marketing.ctaTitle")}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("marketing.ctaDescription")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
              <Link
                href="/register"
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:scale-105 duration-200 group"
                )}
              >
                {LANDING_PAGE_TRANSLATIONS.getStartedButton}
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary/30 bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/5 group"
              >
                <Calendar className="mr-2 size-4" />
                {LANDING_PAGE_TRANSLATIONS.scheduleDemo}
                <ArrowRight className="ml-2 size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">No credit card required. Start building today.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
