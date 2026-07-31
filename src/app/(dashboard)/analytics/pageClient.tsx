"use client";

import * as React from "react";
import useSWR from "swr";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { CHART_COLORS } from "@/components/dashboard/ChartComponents";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

const DATE_RANGES = [
  { value: "7d", key: "last7Days" },
  { value: "30d", key: "last30Days" },
  { value: "90d", key: "last90Days" },
  { value: "custom", key: "customRange" },
] as const;

export function AnalyticsPageClient() {
  const { t } = useLocalizationContext();
  const [dateRange, setDateRange] = React.useState("7d");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");

  const overviewParams = new URLSearchParams({ range: dateRange });
  if (dateRange === "custom" && customFrom) overviewParams.set("from", customFrom);
  if (dateRange === "custom" && customTo) overviewParams.set("to", customTo);

  const trendParams = new URLSearchParams({ range: dateRange });
  if (dateRange === "custom" && customFrom) trendParams.set("from", customFrom);
  if (dateRange === "custom" && customTo) trendParams.set("to", customTo);

  const {
    data: overviewData,
    error: overviewError,
    isLoading: overviewLoading,
    mutate: mutateOverview,
  } = useSWR(`/api/analytics/overview?${overviewParams.toString()}`, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: trendData,
    isLoading: trendLoading,
    mutate: mutateTrend,
  } = useSWR(`/api/analytics/trend?${trendParams.toString()}`, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: eventsData,
    isLoading: eventsLoading,
  } = useSWR("/api/analytics/events?limit=20", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const overview = overviewData?.success ? overviewData.data : null;
  const trend = trendData?.success ? trendData.data : null;
  const events = eventsData?.success ? eventsData.data?.events : [];

  const totalEvents = overview?.totalEvents ?? 0;
  const uniqueUsers = overview?.uniqueUsers ?? 0;
  const eventsToday = overview?.eventsToday ?? 0;
  const eventsYesterday = overview?.eventsYesterday ?? 0;
  const topEventType = overview?.topEventType ?? "-";
  const todayVsYesterday = eventsYesterday > 0
    ? Math.round(((eventsToday - eventsYesterday) / eventsYesterday) * 100)
    : eventsToday > 0 ? 100 : 0;
  const todayTrendUp = todayVsYesterday >= 0;

  const trendDataPoints = React.useMemo(() => {
    if (!trend?.daily) return [];
    return trend.daily.map((d: any) => ({
      name: d.date,
      events: d.count,
    }));
  }, [trend]);

  const categoryData = React.useMemo(() => {
    if (!trend?.categories) return [];
    return trend.categories.map((c: any, i: number) => ({
      name: c.name,
      value: c.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [trend]);

  const topEventsData = React.useMemo(() => {
    if (!trend?.topEvents) return [];
    return trend.topEvents.map((e: any, i: number) => ({
      name: e.type,
      count: e.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [trend]);

  const categoryDistributionData = React.useMemo(() => {
    if (!trend?.categories) return [];
    return trend.categories.map((c: any, i: number) => ({
      name: c.name,
      value: c.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [trend]);

  const handleRefresh = () => {
    mutateOverview();
    mutateTrend();
    toast.success(t("analytics.refresh", "Refresh"));
  };

  const handleExportCSV = () => {
    if (!events?.length) return;
    const headers = "Type,Timestamp,User\n";
    const rows = events.map((e: any) => `${e.type},${e.timestamp},${e.user}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("analytics.exportCsv", "Export CSV"));
  };

  const isLoading = overviewLoading || trendLoading;
  const hasError = overviewError && !overview;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("analytics.title", "Analytics Dashboard")}
        description={t("analytics.description", "Track your platform activity and performance")}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 size-4" />
              {t("analytics.exportCsv", "Export CSV")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 size-4" />
              {t("analytics.refresh", "Refresh")}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {DATE_RANGES.map((range) => (
          <Button
            key={range.value}
            variant={dateRange === range.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(range.value)}
          >
            {t(`analytics.${range.key}`, range.value)}
          </Button>
        ))}
        {dateRange === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <Calendar className="size-4 text-muted-foreground" />
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
            />
            <span className="text-muted-foreground text-sm">{t("analytics.to", "To")}</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="size-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
        </div>
      ) : hasError ? (
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Error")}</p>
            <p className="text-sm text-muted-foreground mb-4">{t("analytics.noData", "No data available for this period")}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard>
              <p className="text-xs text-muted-foreground">{t("analytics.totalEvents", "Total Events")}</p>
              <p className="mt-2 text-2xl font-semibold">{new Intl.NumberFormat("en-US").format(totalEvents)}</p>
            </DashboardCard>
            <DashboardCard>
              <p className="text-xs text-muted-foreground">{t("analytics.uniqueUsers", "Unique Users")}</p>
              <p className="mt-2 text-2xl font-semibold">{new Intl.NumberFormat("en-US").format(uniqueUsers)}</p>
            </DashboardCard>
            <DashboardCard>
              <p className="text-xs text-muted-foreground">{t("analytics.eventsToday", "Events Today")}</p>
              <p className="mt-2 text-2xl font-semibold">{new Intl.NumberFormat("en-US").format(eventsToday)}</p>
              <p className={`text-xs flex items-center gap-1 mt-1 ${todayTrendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {todayTrendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {Math.abs(todayVsYesterday)}% {t("analytics.vsYesterday", "vs yesterday")}
              </p>
            </DashboardCard>
            <DashboardCard>
              <p className="text-xs text-muted-foreground">{t("analytics.topEvent", "Top Event")}</p>
              <p className="mt-2 text-2xl font-semibold truncate">{topEventType}</p>
            </DashboardCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title={t("analytics.eventTrend", "Event Trend")}>
              {trendDataPoints.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendDataPoints} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="events"
                      stroke="#3b82f6"
                      fill="url(#eventsGradient)"
                      name={t("analytics.eventTrend", "Event Trend")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  {t("analytics.noData", "No data available for this period")}
                </div>
              )}
            </DashboardCard>

            <DashboardCard title={t("analytics.eventsByCategory", "Events by Category")}>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  {t("analytics.noData", "No data available for this period")}
                </div>
              )}
            </DashboardCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title={t("analytics.topEvents", "Top Events")}>
              {topEventsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topEventsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="name" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip />
                    <Bar dataKey="count" name={t("analytics.topEvents", "Top Events")} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  {t("analytics.noData", "No data available for this period")}
                </div>
              )}
            </DashboardCard>

            <DashboardCard title={t("analytics.categoryDistribution", "Category Distribution")}>
              {categoryDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  {t("analytics.noData", "No data available for this period")}
                </div>
              )}
            </DashboardCard>
          </div>

          <DashboardCard title={t("analytics.recentActivity", "Recent Activity")}>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : events?.length > 0 ? (
              <div className="space-y-3">
                {events.map((event: any, index: number) => (
                  <div
                    key={event.id ?? index}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{event.type}</span>
                        <Badge tone="info">{event.category ?? event.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.user ?? "-"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {event.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                {t("analytics.noEvents", "No events recorded yet")}
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </div>
  );
}
