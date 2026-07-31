"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, Gauge, Trash2, FileBarChart, Lightbulb, Loader, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { cn } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type Tab = "overview" | "metrics" | "reports" | "cache" | "recommendations";

const RECOMMENDATIONS = [
  { id: "1", title: "Enable SWC minifier", description: "SWC minifier reduces build size by 20-30% compared to Terser.", impact: "high" as const, applied: true },
  { id: "2", title: "Optimize package imports", description: "Tree-shake lucide-react and recharts to reduce client bundle.", impact: "high" as const, applied: true },
  { id: "3", title: "Parallelize health checks", description: "Run service health checks concurrently to reduce monitoring latency.", impact: "medium" as const, applied: true },
  { id: "4", title: "Parallelize dashboard queries", description: "Execute independent database queries concurrently with Promise.all.", impact: "medium" as const, applied: true },
  { id: "5", title: "Enable image AVIF format", description: "AVIF provides better compression than WebP for modern browsers.", impact: "low" as const, applied: true },
  { id: "6", title: "External packages for server", description: "Move nodemailer and mail packages to serverExternalPackages to reduce bundle.", impact: "medium" as const, applied: true },
];

export function PerformancePageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");
  const [metricSearch, setMetricSearch] = React.useState("");
  const [metricCategory, setMetricCategory] = React.useState("all");
  const [metricPage, setMetricPage] = React.useState(1);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/performance/overview", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const { data: metricsData, isLoading: metricsLoading } = useSWR("/api/admin/performance/metrics", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const { data: reportsData } = useSWR("/api/admin/performance/reports", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const { data: cacheData } = useSWR("/api/admin/performance/cache", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const overview = data?.success ? data.data : null;
  const metrics = metricsData?.success && Array.isArray(metricsData.data) ? metricsData.data : [];
  const reports = reportsData?.success && Array.isArray(reportsData.data) ? reportsData.data : [];
  const cache = cacheData?.success ? cacheData.data : null;

  const performanceScore = React.useMemo(() => {
    if (!overview) return 0;
    const hitRate = overview.cacheHitRate ?? 0;
    const respTime = overview.avgResponseTime ?? 0;
    const memUsage = overview.memoryUsage ?? 0;
    let score = 100;
    if (hitRate < 80) score -= (80 - hitRate);
    if (respTime > 200) score -= Math.min(30, (respTime - 200) / 10);
    if (memUsage > 80) score -= (memUsage - 80);
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [overview]);

  const filteredMetrics = React.useMemo(() => {
    let result = metrics;
    if (metricSearch) {
      result = result.filter((m: any) => (m.name || "").toLowerCase().includes(metricSearch.toLowerCase()));
    }
    if (metricCategory !== "all") {
      result = result.filter((m: any) => m.category === metricCategory);
    }
    return result;
  }, [metrics, metricSearch, metricCategory]);

  const pageSize = 20;
  const paginatedMetrics = filteredMetrics.slice((metricPage - 1) * pageSize, metricPage * pageSize);
  const totalPages = Math.ceil(filteredMetrics.length / pageSize);

  const categories = React.useMemo(() => {
    const cats = new Set(metrics.map((m: any) => m.category));
    return ["all", ...Array.from(cats)];
  }, [metrics]);

  const handleClearCache = async () => {
    try {
      const res = await fetch("/api/admin/performance/cache", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear cache");
      toast.success(t("admin.cacheCleared", "Cache cleared"));
      mutate();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/admin/performance/reports", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate report");
      toast.success(t("admin.reportGenerated", "Report generated"));
      mutate();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("admin.overview", "Overview") },
    { key: "metrics", label: t("admin.metrics", "Metrics") },
    { key: "reports", label: t("admin.reports", "Reports") },
    { key: "cache", label: t("admin.cacheSize", "Cache") },
    { key: "recommendations", label: t("admin.recommendations", "Recommendations") },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.performance", "Performance") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.performance", "Performance")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.performanceDescription", "System performance metrics, caching, and optimization")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.performance", "Performance") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.performance", "Performance")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.performanceDescription", "System performance metrics, caching, and optimization")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Error")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.performance", "Performance") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gauge className="size-8 text-primary" />
              {t("admin.performance", "Performance")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.performanceDescription", "System performance metrics, caching, and optimization")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.performanceScore", "Performance Score")}</p>
                <p className={cn("mt-2 text-3xl font-bold", getScoreColor(performanceScore))}>{performanceScore}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.cacheHitRate", "Cache Hit Rate")}</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.cacheHitRate ?? 0}%</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.bundleSize", "Bundle Size")}</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.bundleSize ?? "N/A"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.avgResponseTime", "Avg Response Time")}</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.avgResponseTime ?? 0}ms</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.memoryUsage", "Memory Usage")}</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.memoryUsage ?? 0}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={metricSearch}
                  onChange={(e) => { setMetricSearch(e.target.value); setMetricPage(1); }}
                  placeholder={t("common.search", "Search") + "..."}
                  className="pl-9"
                />
              </div>
              <select
                value={metricCategory}
                onChange={(e) => { setMetricCategory(e.target.value); setMetricPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === "all" ? t("common.all", "All") : cat}</option>
                ))}
              </select>
            </div>
            {metricsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : paginatedMetrics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.name", "Name")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("admin.metricsCategory", "Category")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("admin.metricsValue", "Value")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("admin.responseTime", "Unit")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("admin.createdAt", "Recorded At")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMetrics.map((m: any) => (
                        <tr key={m.id} className="border-b border-border/50">
                          <td className="py-2 px-3 font-medium">{m.name}</td>
                          <td className="py-2 px-3"><Badge tone="muted">{m.category}</Badge></td>
                          <td className="py-2 px-3">{m.value}</td>
                          <td className="py-2 px-3 text-muted-foreground">{m.unit || "-"}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{m.recordedAt ? new Date(m.recordedAt).toLocaleString() : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t("adminDataTable.showing", "Showing")} {paginatedMetrics.length} of {filteredMetrics.length}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={metricPage <= 1} onClick={() => setMetricPage((p) => p - 1)}>
                      {t("admin.previousPage", "Previous")}
                    </Button>
                    <span>{metricPage} / {totalPages || 1}</span>
                    <Button variant="outline" size="sm" disabled={metricPage >= totalPages} onClick={() => setMetricPage((p) => p + 1)}>
                      {t("admin.nextPage", "Next")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={handleGenerateReport}>
                <FileBarChart className="mr-2 size-4" />
                {t("admin.generateReport", "Generate Report")}
              </Button>
            </div>
            {reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
            ) : (
              <div className="space-y-2">
                {reports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.createdAt ? new Date(report.createdAt).toLocaleString() : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.score != null && (
                        <Badge tone={report.score >= 80 ? "success" : report.score >= 60 ? "warning" : "error"}>
                          {report.score}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "cache" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.cacheSize", "Cache Size")}</p>
                <p className="mt-2 text-2xl font-semibold">{cache?.size ?? "N/A"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.cacheHitRate", "Cache Hit Rate")}</p>
                <p className="mt-2 text-2xl font-semibold">{cache?.hitRate ?? 0}%</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("admin.queryTime", "Query Time")}</p>
                <p className="mt-2 text-2xl font-semibold">{cache?.avgQueryTime ?? 0}ms</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearCache}>
              <Trash2 className="mr-2 size-4" />
              {t("admin.clearCache", "Clear Cache")}
            </Button>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec) => (
              <div key={rec.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <Lightbulb className="size-5 mt-0.5 text-yellow-500 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{rec.title}</p>
                    <Badge tone={rec.impact === "high" ? "error" : rec.impact === "medium" ? "warning" : "muted"}>
                      {rec.impact === "high" ? t("admin.highImpact", "High Impact") : rec.impact === "medium" ? t("admin.mediumImpact", "Medium Impact") : t("admin.lowImpact", "Low Impact")}
                    </Badge>
                    {rec.applied && <Badge tone="success">{t("admin.optimizationsApplied", "Applied")}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
