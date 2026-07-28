"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { Boxes, Folder, Image, Clapperboard, Bot, Send, CreditCard, BarChart3, Store, Cpu, LucideIcon } from "lucide-react";
import { useLandingSections } from "@/hooks/use-landing-sections";

const ICON_MAP: Record<string, LucideIcon> = {
  boxes: Boxes,
  image: Image,
  "folder-open": Folder,
  clapperboard: Clapperboard,
  bot: Bot,
  send: Send,
  "credit-card": CreditCard,
  "bar-chart-3": BarChart3,
  store: Store,
};

export function FeaturesContent() {
  const { t } = useLocalizationContext();
  const { sections } = useLandingSections();
  const featuresSection = sections.find((s) => s.sectionKey === "features");
  const features = (featuresSection?.config.features as Array<{ title: string; description: string; icon?: string }>) || [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {featuresSection?.title || t("marketing.featuresTitle")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {featuresSection?.description || t("marketing.featuresDescription")}
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon ? ICON_MAP[feature.icon] : Cpu;
          return (
             <a key={String(feature.title || '') + idx} href={`/features#feature-${idx}`} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/20">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
