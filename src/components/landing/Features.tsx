"use client";

import * as React from "react";
import {
  Boxes,
  Clapperboard,
  CreditCard,
  Cpu,
  FolderOpen,
  ImageIcon,
  Play,
  BarChart3,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";

const features = [
  { key: "marketing.sectionWorkspace", descKey: "marketing.featureWorkspacesDesc", icon: Boxes },
  { key: "marketing.sectionProjects", descKey: "marketing.featureProjectsDesc", icon: FolderOpen },
  { key: "marketing.sectionMedia", descKey: "marketing.featureMediaDesc", icon: ImageIcon },
  { key: "marketing.sectionProduction", descKey: "marketing.featureProductionDesc", icon: Clapperboard },
  { key: "marketing.featureAI", descKey: "marketing.featureAIDesc", icon: Cpu },
  { key: "marketing.sectionPublishing", descKey: "marketing.featurePublishingDesc", icon: Play },
  { key: "marketing.sectionBilling", descKey: "marketing.featureBillingDesc", icon: CreditCard },
  { key: "marketing.sectionAnalytics", descKey: "marketing.featureAnalyticsDesc", icon: BarChart3 },
  { key: "marketing.sectionMarketplace", descKey: "marketing.featureMarketplaceDesc", icon: Store },
];

export function Features() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" id="features" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.featuresTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.featuresDescription")}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{t(feature.key)}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-6">{t(feature.descKey)}</p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center text-sm font-medium text-primary transition hover:underline"
              >
                {t("marketing.learnMore")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
