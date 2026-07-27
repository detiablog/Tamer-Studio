"use client";

import * as React from "react";
import {
  Globe,
  BookOpen,
  Workflow,
  Sliders,
  DollarSign,
  Clock,
  GitBranch,
  Cpu,
  LucideIcon,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

const ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe,
  "book-open": BookOpen,
  workflow: Workflow,
  sliders: Sliders,
  "dollar-sign": DollarSign,
  clock: Clock,
  "git-branch": GitBranch,
};

export function AIPlatform({ section }: SectionRendererProps) {
  const { t, resolve } = useLocalizationContext();

  const heading = resolve(section.config.heading as string) || section.title || t("marketing.aiPlatformTitle");
  const description = resolve(section.config.description as string) || section.description || t("marketing.aiPlatformDescription");
  const features = (section.config.features as Array<{ title: string; description: string; icon?: string }>) || [];

  return (
    <section className="border-t border-border" id="ai-platform" aria-labelledby="ai-platform-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="ai-platform-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon ? ICON_MAP[feature.icon] : Cpu;
            return (
              <div
                key={String(feature.title || '') + idx}
                className="rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-6">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
