"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

export function Screenshots({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();

  const heading = (section.config.heading as string) || section.title || t("marketing.screenshotsTitle");
  const description = (section.config.description as string) || section.description || "";
  const screenshots = (section.config.screenshots as Array<{ label: string }>) || [];

  return (
    <section className="border-t border-border" id="screenshots" aria-labelledby="screenshots-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="screenshots-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {screenshots.map((screenshot, idx) => (
            <div
              key={String(screenshot.label || '') + idx}
              className="rounded-2xl border border-border bg-card overflow-hidden transition hover:border-foreground/10"
            >
              <div className="h-40 w-full bg-gradient-to-br from-muted/60 via-background to-background" aria-hidden="true">
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">{screenshot.label}</span>
                </div>
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="text-sm font-medium">{screenshot.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
