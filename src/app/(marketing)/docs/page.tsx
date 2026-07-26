"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";

export default function DocsPage() {
  const { t } = useLocalizationContext();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.docs.title", "Documentation")}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-7">
            {t("marketing.docs.description", "Learn how to use Tamer Studio to manage your content production lifecycle.")}
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold">{t("marketing.docs.gettingStarted", "Getting Started")}</h3>
              <p className="text-sm text-muted-foreground">{t("marketing.docs.gettingStartedDesc", "Set up your workspace and connect your first AI provider.")}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold">{t("marketing.docs.projects", "Projects")}</h3>
              <p className="text-sm text-muted-foreground">{t("marketing.docs.projectsDesc", "Organize production projects with folders, tags, and assets.")}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold">{t("marketing.docs.aiPlatform", "AI Platform")}</h3>
              <p className="text-sm text-muted-foreground">{t("marketing.docs.aiPlatformDesc", "Connect providers, manage models, and compose prompts.")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
