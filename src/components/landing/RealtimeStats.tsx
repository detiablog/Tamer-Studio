"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface Metrics {
  activeUsers: number;
  projects: number;
  aiJobs: number;
  imagesGenerated: number;
  videosGenerated: number;
  storageUsed: string;
  apiRequests: string;
  queueLength: number;
}

const fallbackMetrics: Metrics = {
  activeUsers: 0,
  projects: 0,
  aiJobs: 0,
  imagesGenerated: 0,
  videosGenerated: 0,
  storageUsed: "0 GB",
  apiRequests: "0",
  queueLength: 0,
};

function formatValue(value: string | number): string {
  if (typeof value === "string") return value;
  return value.toLocaleString("en-US");
}

export function RealtimeStats({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();
  const [metrics, setMetrics] = React.useState<Metrics>(fallbackMetrics);
  const [loading, setLoading] = React.useState(true);

  const heading = (section.config.heading as string) || section.title || t("marketing.statsSectionTitle");
  const description = (section.config.description as string) || section.description || "";
  const statItems = (section.config.statItems as Array<{ key: keyof Metrics; label: string }>) || [
    { key: "activeUsers", label: t("marketing.statActiveUsers") },
    { key: "projects", label: t("marketing.statProjects") },
    { key: "aiJobs", label: t("marketing.statAIJobs") },
    { key: "imagesGenerated", label: t("marketing.statImagesGenerated") },
    { key: "videosGenerated", label: t("marketing.statVideosGenerated") },
    { key: "storageUsed", label: t("marketing.statStorageUsed") },
    { key: "apiRequests", label: t("marketing.statApiRequests") },
    { key: "queueLength", label: t("marketing.statQueueLength") },
  ];

  React.useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      try {
        const res = await fetch("/api/metrics/public", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const response = await res.json();
        const metricsData = response?.data ?? fallbackMetrics;
        if (!cancelled) {
          setMetrics(metricsData);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setMetrics(fallbackMetrics);
          setLoading(false);
        }
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="border-t border-border" id="stats" aria-labelledby="stats-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground">
            <Activity className="size-5" />
          </div>
          <h2 id="stats-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/10"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">
                {loading ? "—" : formatValue(metrics[item.key])}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
