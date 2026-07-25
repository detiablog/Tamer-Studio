"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

export function Hero() {
  const { t } = useLocalizationContext();

  const providers = [
    { key: "marketing.providerOpenAI", icon: "O" },
    { key: "marketing.providerGemini", icon: "G" },
    { key: "marketing.providerClaude", icon: "C" },
    { key: "marketing.providerOpenRouter", icon: "OR" },
    { key: "marketing.providerKilo", icon: "K" },
  ];

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/40 via-background to-background"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Rocket className="size-6" />
          </div>

          <h1
            id="hero-heading"
            className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t("marketing.heroTitle")}
          </h1>

          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            {t("marketing.heroDescription")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={cn(
                "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
              )}
            >
              {t("marketing.heroCtaPrimary")}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              {t("marketing.heroCtaSecondary")}
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            {t("marketing.socialProofTitle")}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {providers.map((provider) => (
              <span
                key={provider.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                  {provider.icon}
                </span>
                {t(provider.key)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <div
              className="h-64 sm:h-80 w-full bg-gradient-to-br from-muted/60 via-background to-background"
              aria-hidden="true"
            >
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Rocket className="mx-auto size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground/60">Product Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
