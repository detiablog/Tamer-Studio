"use client";

import * as React from "react";
import {
  BookOpen,
  Clock,
  DollarSign,
  GitBranch,
  Globe,
  Sliders,
  Workflow,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const aiFeatures = [
  { key: "marketing.aiMultiProvider", descKey: "marketing.aiMultiProviderDesc", icon: Globe },
  { key: "marketing.aiPromptLibrary", descKey: "marketing.aiPromptLibraryDesc", icon: BookOpen },
  { key: "marketing.aiWorkflowAutomation", descKey: "marketing.aiWorkflowAutomationDesc", icon: Workflow },
  { key: "marketing.aiModelSelection", descKey: "marketing.aiModelSelectionDesc", icon: Sliders },
  { key: "marketing.aiCostOptimization", descKey: "marketing.aiCostOptimizationDesc", icon: DollarSign },
  { key: "marketing.aiHistory", descKey: "marketing.aiHistoryDesc", icon: Clock },
  { key: "marketing.aiVersioning", descKey: "marketing.aiVersioningDesc", icon: GitBranch },
];

export function AIPlatform() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" id="ai-platform" aria-labelledby="ai-platform-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="ai-platform-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.aiPlatformTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.aiPlatformDescription")}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {aiFeatures.map((feature) => (
            <div
              key={feature.key}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{t(feature.key)}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-6">{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
