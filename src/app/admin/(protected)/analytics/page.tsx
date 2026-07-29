"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Download, TrendingUp, Loader } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

export default function AnalyticsPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [search, setSearch] = React.useState("");
  const [dateRange, setDateRange] = React.useState("7d");

  const analyticsUrl = `/api/admin/analytics?range=${dateRange}`;
  const { data, error, isLoading, mutate } = useSWR(analyticsUrl, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const entries = React.useMemo(() => {
    if (data?.success && data.data?.entries) return data.data.entries;
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => entries.filter((a: any) => a.date?.toLowerCase().includes(search.toLowerCase())),
    [entries, search]
  );

  const pageViewsTotal = entries.reduce((acc: number, a: any) => acc + (a.pageViews || 0), 0);
  const visitorsTotal = entries.reduce((acc: number, a: any) => acc + (a.uniqueVisitors || 0), 0);
  const conversionsTotal = entries.reduce((acc: number, a: any) => acc + (a.conversions || 0), 0);
  const revenueTotal = entries.reduce((acc: number, a: any) => acc + (a.revenue || 0), 0);

  const handleExportCSV = () => {
    const headers = `${t("common.date")},${t("admin.analytics.pageViews")},${t("admin.analytics.visitors")},${t("admin.analytics.bounceRate")},${t("admin.analytics.avgDuration")},${t("admin.analytics.conversions")},${t("admin.analytics.revenue")}\n`;
    const rows = entries.map((a: any) => `${a.date},${a.pageViews},${a.uniqueVisitors},${a.bounceRate},${a.avgDuration},${a.conversions},${a.revenue}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.analytics.csvExported", "CSV exported"));
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(entries, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.analytics.jsonExported", "JSON exported"));
  };

  const handleExportPNG = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 400);
      ctx.fillStyle = "#000000";
      ctx.font = "24px sans-serif";
      ctx.fillText(t("admin.analytics.chartExport", "Analytics Chart Export"), 20, 40);
      ctx.font = "16px sans-serif";
      ctx.fillText(`${t("admin.analytics.dateRange", "Date Range")}: ${dateRange}`, 20, 80);
      ctx.fillText(`${t("admin.analytics.totalPageViews", "Total Page Views")}: ${formatNumber(pageViewsTotal)}`, 20, 120);
      ctx.fillText(`${t("admin.analytics.totalVisitors", "Total Visitors")}: ${formatNumber(visitorsTotal)}`, 20, 150);
      ctx.fillText(`${t("admin.analytics.totalRevenue", "Total Revenue")}: $${formatNumber(revenueTotal)}`, 20, 180);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${dateRange}.png`;
      link.click();
      toast.success(t("admin.analytics.pngExported", "Chart exported as PNG"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.analytics", "Analytics") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.analytics", "Analytics")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.analytics.description", "View platform analytics and insights")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
                <div className="mt-3 h-7 w-24 animate-pulse rounded bg-muted/40" />
              </div>
            ))}
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
        <Breadcrumbs items={[{ label: t("admin.analytics", "Analytics") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.analytics", "Analytics")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.analytics.description", "View platform analytics and insights")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message || t("admin.analytics.loadError", "Could not load analytics data")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.analytics", "Analytics") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.analytics", "Analytics")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.analytics.description", "View platform analytics and insights")}</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <option value="7d">{t("admin.analytics.last7Days", "Last 7 days")}</option>
              <option value="30d">{t("admin.analytics.last30Days", "Last 30 days")}</option>
              <option value="90d">{t("admin.analytics.last90Days", "Last 90 days")}</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="mr-2 size-4" />CSV</Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}><Download className="mr-2 size-4" />JSON</Button>
            <Button variant="outline" size="sm" onClick={handleExportPNG}><Download className="mr-2 size-4" />PNG</Button>
            <Button variant="outline" size="sm" onClick={() => mutate()}><RefreshCw className="mr-2 size-4" />{t("common.refresh", "Refresh")}</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.pageViews", "Page Views")}</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(pageViewsTotal)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+12% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.uniqueVisitors", "Unique Visitors")}</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(visitorsTotal)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+8% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.conversions", "Conversions")}</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(conversionsTotal)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+5% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.revenue", "Revenue")}</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(revenueTotal)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+15% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.analytics.searchByDate", "Search by date...")} className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(a) => a.id}
          columns={[
            { key: "date", header: t("common.date", "Date"), sortable: true, render: (item: any) => <span className="text-sm font-medium">{item.date}</span> },
            { key: "pageViews", header: t("admin.analytics.pageViews", "Page Views"), sortable: true, render: (item: any) => <span className="text-sm">{formatNumber(item.pageViews)}</span> },
            { key: "uniqueVisitors", header: t("admin.analytics.visitors", "Visitors"), sortable: true, render: (item: any) => <span className="text-sm">{formatNumber(item.uniqueVisitors)}</span> },
            { key: "bounceRate", header: t("admin.analytics.bounceRate", "Bounce Rate"), sortable: true, render: (item: any) => <Badge tone={parseFloat(item.bounceRate) > 35 ? "warning" : "success"}>{item.bounceRate}</Badge> },
            { key: "avgDuration", header: t("admin.analytics.avgDuration", "Avg Duration"), render: (item: any) => <span className="text-sm">{item.avgDuration}</span> },
            { key: "conversions", header: t("admin.analytics.conversions", "Conversions"), sortable: true, render: (item: any) => <span className="text-sm">{formatNumber(item.conversions)}</span> },
            { key: "revenue", header: t("admin.analytics.revenue", "Revenue"), render: (item: any) => <span className="text-sm font-medium">{formatCurrency(item.revenue)}</span> },
          ]}
        />
      </DashboardCard>
    </div>
  );
}
