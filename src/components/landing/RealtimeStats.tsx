"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

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

const statItems: { key: keyof Metrics; labelKey: string }[] = [
  { key: "activeUsers", labelKey: "marketing.statActiveUsers" },
  { key: "projects", labelKey: "marketing.statProjects" },
  { key: "aiJobs", labelKey: "marketing.statAIJobs" },
  { key: "imagesGenerated", labelKey: "marketing.statImagesGenerated" },
  { key: "videosGenerated", labelKey: "marketing.statVideosGenerated" },
  { key: "storageUsed", labelKey: "marketing.statStorageUsed" },
  { key: "apiRequests", labelKey: "marketing.statApiRequests" },
  { key: "queueLength", labelKey: "marketing.statQueueLength" },
];

function formatValue(value: string | number): string {
  if (typeof value === "string") return value;
  return value.toLocaleString();
}

export function RealtimeStats() {
  const { t } = useLocalizationContext();
  const [metrics, setMetrics] = React.useState<Metrics>(fallbackMetrics);
  const [loading, setLoading] = React.useState(true);

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
            {t("marketing.statsSectionTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.statsSectionDescription")}</p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/10"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t(item.labelKey)}</p>
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
