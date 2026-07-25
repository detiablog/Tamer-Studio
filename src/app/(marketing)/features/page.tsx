"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { Boxes, Folder, Image, Clapperboard, Bot, Send, CreditCard, BarChart3, Store } from "lucide-react";

const features = [
  { key: "sectionWorkspace", icon: Boxes, href: "/features#workspace" },
  { key: "sectionProjects", icon: Folder, href: "/features#projects" },
  { key: "sectionMedia", icon: Image, href: "/features#media" },
  { key: "sectionProduction", icon: Clapperboard, href: "/features#production" },
  { key: "sectionPublishing", icon: Send, href: "/features#publishing" },
  { key: "sectionBilling", icon: CreditCard, href: "/pricing" },
  { key: "sectionAnalytics", icon: BarChart3, href: "/features#analytics" },
  { key: "sectionMarketplace", icon: Store, href: "/features#marketplace" },
];

export default function FeaturesPage() {
  const { t } = useLocalizationContext();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("marketing.featuresTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("marketing.featuresDescription")}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <a key={feature.key} href={feature.href} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/20">
            <feature.icon className="size-6 text-primary" />
            <h3 className="mt-4 font-semibold">{t(`marketing.${feature.key}`)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t(`marketing.${feature.key}Desc`)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
