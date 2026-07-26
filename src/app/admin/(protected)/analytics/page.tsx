"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, Download, Calendar, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_ANALYTICS = [
  { id: "a_1", date: "23/07/2026", pageViews: 12450, uniqueVisitors: 8230, bounceRate: "32.4%", avgDuration: "4m 23s", conversions: 342, revenue: "$8,420" },
  { id: "a_2", date: "22/07/2026", pageViews: 11890, uniqueVisitors: 7890, bounceRate: "34.1%", avgDuration: "3m 58s", conversions: 298, revenue: "$7,150" },
  { id: "a_3", date: "21/07/2026", pageViews: 13200, uniqueVisitors: 8750, bounceRate: "31.8%", avgDuration: "4m 45s", conversions: 389, revenue: "$9,210" },
  { id: "a_4", date: "20/07/2026", pageViews: 10980, uniqueVisitors: 7320, bounceRate: "35.2%", avgDuration: "3m 42s", conversions: 267, revenue: "$6,340" },
  { id: "a_5", date: "19/07/2026", pageViews: 11560, uniqueVisitors: 7650, bounceRate: "33.7%", avgDuration: "4m 10s", conversions: 312, revenue: "$7,890" },
];

// Helper to format numbers consistently across server and client
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

export default function AnalyticsPage() {
  const { t } = useLocalizationContext();
  const [data, setData] = React.useState(MOCK_ANALYTICS);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [dateRange, setDateRange] = React.useState("7d");
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Fix hydration mismatch by only rendering after hydration
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const filtered = data.filter((a) => a.date.toLowerCase().includes(search.toLowerCase()));

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setData(MOCK_ANALYTICS); setLoading(false); toast.success(t("admin.analytics.refreshed", "Analytics refreshed")); }, 800);
  };

  const handleExportCSV = () => {
    const headers = "Date,Page Views,Visitors,Bounce Rate,Avg Duration,Conversions,Revenue\n";
    const rows = data.map((a) => `${a.date},${a.pageViews},${a.uniqueVisitors},${a.bounceRate},${a.avgDuration},${a.conversions},${a.revenue}`).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.analytics.csvExported", "CSV exported"));
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.analytics.jsonExported", "JSON exported"));
  };

  const parseRevenue = (revenueStr: string): number => {
    const parsed = parseInt(revenueStr.replace(/[$,]/g, ""), 10);
    return isNaN(parsed) ? 0 : parsed;
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
      ctx.fillText("Analytics Chart Export", 20, 40);
      ctx.font = "16px sans-serif";
      ctx.fillText(`Date Range: ${dateRange}`, 20, 80);
      ctx.fillText(`Total Page Views: ${formatNumber(data.reduce((acc, a) => acc + a.pageViews, 0))}`, 20, 120);
      ctx.fillText(`Total Visitors: ${formatNumber(data.reduce((acc, a) => acc + a.uniqueVisitors, 0))}`, 20, 150);
      ctx.fillText(`Total Revenue: $${formatNumber(data.reduce((acc, a) => acc + parseRevenue(a.revenue), 0))}`, 20, 180);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${dateRange}.png`;
      link.click();
      toast.success(t("admin.analytics.pngExported", "Chart exported as PNG"));
    }
  };

  // Use placeholder values during SSR to prevent hydration mismatch
  const pageViewsTotal = data.reduce((acc, a) => acc + a.pageViews, 0);
  const visitorsTotal = data.reduce((acc, a) => acc + a.uniqueVisitors, 0);
  const conversionsTotal = data.reduce((acc, a) => acc + a.conversions, 0);
  const revenueTotal = data.reduce((acc, a) => acc + parseRevenue(a.revenue), 0);

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
            <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="mr-2 size-4" />{t("admin.analytics.csvExported", "CSV")}</Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}><Download className="mr-2 size-4" />{t("admin.analytics.jsonExported", "JSON")}</Button>
            <Button variant="outline" size="sm" onClick={handleExportPNG}><Download className="mr-2 size-4" />{t("admin.analytics.pngExported", "PNG")}</Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}><RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />{t("common.refresh", "Refresh")}</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.pageViews", "Page Views")}</p>
            <p className="mt-2 text-2xl font-semibold">{isHydrated ? formatNumber(pageViewsTotal) : pageViewsTotal}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+12% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.uniqueVisitors", "Unique Visitors")}</p>
            <p className="mt-2 text-2xl font-semibold">{isHydrated ? formatNumber(visitorsTotal) : visitorsTotal}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+8% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.conversions", "Conversions")}</p>
            <p className="mt-2 text-2xl font-semibold">{isHydrated ? formatNumber(conversionsTotal) : conversionsTotal}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+5% {t("admin.analytics.thanLastPeriod", "vs last period")}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">{t("admin.analytics.revenue", "Revenue")}</p>
            <p className="mt-2 text-2xl font-semibold">${isHydrated ? formatNumber(revenueTotal) : revenueTotal}</p>
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
            { key: "date", header: t("common.date", "Date"), sortable: true, render: (item: typeof MOCK_ANALYTICS[0]) => <span className="text-sm font-medium">{item.date}</span> },
            { key: "pageViews", header: t("admin.analytics.pageViews", "Page Views"), sortable: true, render: (item: typeof MOCK_ANALYTICS[0]) => <span className="text-sm">{formatNumber(item.pageViews)}</span> },
            { key: "uniqueVisitors", header: t("admin.analytics.visitors", "Visitors"), sortable: true, render: (item: typeof MOCK_ANALYTICS[0]) => <span className="text-sm">{formatNumber(item.uniqueVisitors)}</span> },
            { key: "bounceRate", header: t("admin.analytics.bounceRate", "Bounce Rate"), sortable: true, render: (item: typeof MOCK_ANALYTICS[0]) => <Badge tone={parseFloat(item.bounceRate) > 35 ? "warning" : "success"}>{item.bounceRate}</Badge> },
            { key: "avgDuration", header: t("admin.analytics.avgDuration", "Avg Duration"), render: (item: typeof MOCK_ANALYTICS[0]) => <span className="text-sm">{item.avgDuration}</span> },
            { key: "conversions", header: t("admin.analytics.conversions", "Conversions"), sortable: true, render: (item: typeof MOCK_ANALYTICS[0]) => <span className="text-sm">{formatNumber(item.conversions)}</span> },
            { key: "revenue", header: t("admin.analytics.revenue", "Revenue"), render: (item: typeof MOCK_ANALYTICS[0]) => <span className="text-sm font-medium">{item.revenue}</span> },
          ]}
        />
      </DashboardCard>
    </div>
  );
}
