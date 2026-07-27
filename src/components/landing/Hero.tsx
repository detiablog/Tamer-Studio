"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useLandingData } from "@/hooks/use-landing-data";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

const providers = [
  { key: "marketing.providerOpenAI", icon: "O" },
  { key: "marketing.providerGemini", icon: "G" },
  { key: "marketing.providerClaude", icon: "C" },
  { key: "marketing.providerOpenRouter", icon: "OR" },
  { key: "marketing.providerKilo", icon: "K" },
];

export function Hero({ section }: SectionRendererProps) {
  const { t, resolve } = useLocalizationContext();
  const { formatPrice, currency, campaign, resolvedCurrency } = useLandingData();

  const heading = resolve(section.config.heading as string) || section.title || t("marketing.heroTitle");
  const description = resolve(section.config.description as string) || section.description || t("marketing.heroDescription");
  const ctaPrimary = resolve(section.config.ctaPrimary as string) || t("marketing.heroCtaPrimary");
  const ctaSecondary = resolve(section.config.ctaSecondary as string) || t("marketing.heroCtaSecondary");
  const badge = resolve(section.config.badge as string) || t("marketing.heroBadge", "AI-Powered");
  const campaignBadge = (section.config.campaignBadge as string) || (campaign?.badge as string) || "";
  const campaignDiscount = (section.config.campaignDiscount as number) || (campaign?.discount as number) || 0;

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"
        aria-hidden="true"
      />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition cursor-default">
            <Sparkles className="size-4" />
            {badge}
          </div>

          {campaignBadge && campaignDiscount > 0 && (
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-1 text-sm font-bold text-green-600">
              {campaignBadge} -{campaignDiscount}%
            </div>
          )}

          <h1
            id="hero-heading"
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            {heading}
          </h1>

          <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            {description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
            <Link
              href="/register"
              className={cn(
                "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:scale-105 duration-200 group"
              )}
            >
              {ctaPrimary}
              <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-muted hover:border-foreground/20 group"
            >
              {ctaSecondary}
              <ArrowRight className="ml-2 size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            {t("marketing.heroTrusted", "Trusted by creators, agencies, and businesses worldwide")}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-semibold">P</kbd>
            <span>{t("marketing.pricing")}</span>
            <span className="text-muted-foreground/40">•</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-semibold">F</kbd>
            <span>{t("marketing.features")}</span>
            <span className="text-muted-foreground/40">•</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-semibold">C</kbd>
            <span>{t("marketing.contact")}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {providers.map((provider) => (
              <span
                key={provider.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-foreground/20 transition"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-br from-primary/20 to-primary/10 text-[10px] font-bold text-primary">
                  {provider.icon}
                </span>
                {t(provider.key)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 sm:mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden hover:border-foreground/10 transition duration-300">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3 bg-muted/30">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <div
              className="h-64 sm:h-80 w-full bg-gradient-to-br from-muted/60 via-background to-background relative overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
                    <Rocket className="size-6 text-primary animate-bounce" />
                  </div>
                  <p className="text-sm text-muted-foreground/60">{t("marketing.heroPreview", "Coming Soon: Live Product Preview")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
