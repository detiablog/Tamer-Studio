"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useLandingData } from "@/hooks/use-landing-data";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

export function CTASection({ section }: SectionRendererProps) {
  const { t, resolve } = useLocalizationContext();
  const { campaign } = useLandingData();

  const heading = resolve(section.config.heading as string) || section.title || t("marketing.ctaTitle");
  const description = resolve(section.config.description as string) || section.description || t("marketing.ctaDescription");
  const ctaPrimaryText = resolve(section.config.ctaPrimary as string) || t("marketing.ctaPrimary");
  const ctaSecondaryText = resolve(section.config.ctaSecondary as string) || t("marketing.ctaSecondary");
  const campaignCta = (campaign?.ctaText as string) || "";
  const campaignHref = (campaign?.ctaHref as string) || "/register";

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
              {heading}
            </div>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
              <Link
                href={campaignHref as Route}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:scale-105 duration-200 group"
                )}
              >
                {campaignCta || ctaPrimaryText}
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href={"/contact" as Route}
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary/30 bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/5 group"
              >
                <Calendar className="mr-2 size-4" />
                {ctaSecondaryText}
                <ArrowRight className="ml-2 size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">{t("marketing.ctaNote", "No credit card required. Start building today.")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
