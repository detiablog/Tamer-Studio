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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

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
    <section className="border-t border-border bg-muted/30" id="features" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("marketing.featuresTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">{t("marketing.featuresDescription")}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
          {features.map((feature, idx) => (
            <div
              key={feature.key}
              className={cn(
                "group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:bg-card/90",
                idx === 1 && "lg:row-span-1"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{t(feature.key)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-6">{t(feature.descKey)}</p>
              <Link
                href="/features"
                className="mt-4 inline-flex items-center text-sm font-semibold text-primary transition group-hover:gap-2 duration-200"
              >
                {t("marketing.learnMore")}
                <ArrowRight className="ml-2 size-4 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/features"
            className="inline-flex items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 hover:border-primary/40 group"
          >
            Explore All Features
            <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </section>
  );
}
