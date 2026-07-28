"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { Badge } from "@/components/ui/Badge";

export function CareersContent() {
  const { t } = useLocalizationContext();

  const benefits = [
    t("marketing.benefits.competitiveSalary", "Competitive salary"),
    t("marketing.benefits.remoteFirst", "Remote-first culture"),
    t("marketing.benefits.healthWellness", "Health and wellness benefits"),
    t("marketing.benefits.learningBudget", "Learning and development budget"),
    t("marketing.benefits.flexibleHours", "Flexible working hours"),
    t("marketing.benefits.teamRetreats", "Annual team retreats"),
  ];

  const positions = [
    {
      id: 1,
      title: "Senior Frontend Engineer",
      location: "Jakarta, Indonesia",
      type: "Full-time",
      description: t("marketing.positions.frontend", "Build and scale the Tamer Studio marketing and dashboard experience with Next.js and React."),
    },
    {
      id: 2,
      title: "Product Designer",
      location: "Remote",
      type: "Full-time",
      description: t("marketing.positions.designer", "Design intuitive interfaces for complex AI workflows and production tools."),
    },
    {
      id: 3,
      title: "Backend Engineer",
      location: "Singapore",
      type: "Full-time",
      description: t("marketing.positions.backend", "Design APIs and background job infrastructure for AI-powered production pipelines."),
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.careersTitle")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("marketing.careersDescription")}</p>
        </div>
        <div className="mt-12">
          <h2 className="text-lg font-semibold">{t("marketing.careersBenefits")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16">
          <h2 className="text-lg font-semibold">{t("marketing.careersOpenPositions")}</h2>
          <div className="mt-6 space-y-4">
            {positions.map((pos) => (
              <div key={pos.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{pos.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{pos.description}</p>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">
                    {t("marketing.careersApply")}
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{pos.location}</span>
                  <span>•</span>
                  <span>{pos.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
