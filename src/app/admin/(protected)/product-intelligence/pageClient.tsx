"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { toast } from "sonner";
import {
  BarChart3,
  Users,
  DollarSign,
  CreditCard,
  Brain,
  Rocket,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Target,
  Download,
  RefreshCw,
  Loader,
  Filter,
  Eye,
  Zap,
  Globe,
  Layout,
  Settings,
  FileText,
  ArrowRight,
} from "lucide-react";

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

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
};

type Tab =
  | "executive"
  | "users"
  | "revenue"
  | "subscriptions"
  | "credits"
  | "ai"
  | "features"
  | "funnels"
  | "retention"
  | "churn"
  | "segments"
  | "publishing"
  | "forecasts"
  | "decisions"
  | "reports";

const TABS: { key: Tab; icon: React.ElementType }[] = [
  { key: "executive", icon: BarChart3 },
  { key: "users", icon: Users },
  { key: "revenue", icon: DollarSign },
  { key: "subscriptions", icon: CreditCard },
  { key: "credits", icon: Zap },
  { key: "ai", icon: Brain },
  { key: "features", icon: Layout },
  { key: "funnels", icon: Filter },
  { key: "retention", icon: Target },
  { key: "churn", icon: TrendingDown },
  { key: "segments", icon: Users },
  { key: "publishing", icon: Globe },
  { key: "forecasts", icon: Rocket },
  { key: "decisions", icon: Settings },
  { key: "reports", icon: FileText },
];

export function ProductIntelligencePageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("executive");
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  const swrOpts = {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    refreshInterval: autoRefresh ? 30000 : 0,
  };

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR("/api/admin/pi/overview", fetcher, swrOpts);
  const { data: usersData, isLoading: usersLoading } = useSWR("/api/admin/pi/users", fetcher, swrOpts);
  const { data: revenueData, isLoading: revenueLoading } = useSWR("/api/admin/pi/revenue", fetcher, swrOpts);
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useSWR("/api/admin/pi/subscriptions", fetcher, swrOpts);
  const { data: creditsData, isLoading: creditsLoading } = useSWR("/api/admin/pi/credits", fetcher, swrOpts);
  const { data: aiData, isLoading: aiLoading } = useSWR("/api/admin/pi/ai", fetcher, swrOpts);
  const { data: featuresData, isLoading: featuresLoading } = useSWR("/api/admin/pi/features", fetcher, swrOpts);
  const { data: funnelsData, isLoading: funnelsLoading } = useSWR("/api/admin/pi/funnels", fetcher, swrOpts);
  const { data: retentionData, isLoading: retentionLoading } = useSWR("/api/admin/pi/retention", fetcher, swrOpts);
  const { data: churnData, isLoading: churnLoading } = useSWR("/api/admin/pi/churn", fetcher, swrOpts);
  const { data: segmentsData, isLoading: segmentsLoading } = useSWR("/api/admin/pi/segments", fetcher, swrOpts);
  const { data: publishingData, isLoading: publishingLoading } = useSWR("/api/admin/pi/publishing", fetcher, swrOpts);
  const { data: forecastsData, isLoading: forecastsLoading } = useSWR("/api/admin/pi/forecasts", fetcher, swrOpts);
  const { data: decisionsData, isLoading: decisionsLoading } = useSWR("/api/admin/pi/decisions", fetcher, swrOpts);
  const { data: reportsData, isLoading: reportsLoading } = useSWR("/api/admin/pi/reports", fetcher, swrOpts);

  const overview = React.useMemo(() => overviewData?.data ?? overviewData ?? null, [overviewData]);
  const users = React.useMemo(() => usersData?.data ?? usersData ?? null, [usersData]);
  const revenue = React.useMemo(() => revenueData?.data ?? revenueData ?? null, [revenueData]);
  const subs = React.useMemo(() => subscriptionsData?.data ?? subscriptionsData ?? null, [subscriptionsData]);
  const credits = React.useMemo(() => creditsData?.data ?? creditsData ?? null, [creditsData]);
  const aiMetrics = React.useMemo(() => aiData?.data ?? aiData ?? null, [aiData]);
  const features = React.useMemo(() => {
    const raw = featuresData?.data ?? featuresData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [featuresData]);
  const funnels = React.useMemo(() => {
    const raw = funnelsData?.data ?? funnelsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [funnelsData]);
  const retention = React.useMemo(() => retentionData?.data ?? retentionData ?? null, [retentionData]);
  const churn = React.useMemo(() => churnData?.data ?? churnData ?? null, [churnData]);
  const segments = React.useMemo(() => {
    const raw = segmentsData?.data ?? segmentsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [segmentsData]);
  const publishing = React.useMemo(() => publishingData?.data ?? publishingData ?? null, [publishingData]);
  const forecasts = React.useMemo(() => {
    const raw = forecastsData?.data ?? forecastsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [forecastsData]);
  const decisions = React.useMemo(() => {
    const raw = decisionsData?.data ?? decisionsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [decisionsData]);
  const reports = React.useMemo(() => {
    const raw = reportsData?.data ?? reportsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [reportsData]);

  const isLoading = overviewLoading && usersLoading && revenueLoading;

  const handleRefreshAll = () => {
    mutateOverview();
    toast.success(t("common.refreshed", "Data refreshed"));
  };

  const renderTrend = (change?: number | null) => {
    if (change == null) return null;
    const num = Number(change);
    if (num > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <TrendingUp className="size-3" />
          {num.toFixed(1)}%
        </span>
      );
    }
    if (num < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <TrendingDown className="size-3" />
          {Math.abs(num).toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3" />
        0%
      </span>
    );
  };

  const renderKpiCard = (label: string, value: string | number, change?: number | null, icon?: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        {renderTrend(change)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("pi.title", "Product Intelligence") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("pi.title", "Product Intelligence")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("pi.description", "Comprehensive product analytics and insights")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("pi.title", "Product Intelligence") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="size-8 text-primary" />
              {t("pi.title", "Product Intelligence")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("pi.description", "Comprehensive product analytics and insights")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={cn("mr-2 size-4", autoRefresh && "animate-spin")} />
              {autoRefresh ? t("pi.autoRefreshOn", "Auto (30s)") : t("pi.autoRefreshOff", "Auto Refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefreshAll}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {t(`pi.tab.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
            </button>
          ))}
        </div>

        {activeTab === "executive" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {renderKpiCard(t("pi.dailyRevenue", "Daily Revenue"), formatCurrency(overview?.dailyRevenue ?? 0), overview?.dailyRevenueChange, DollarSign)}
              {renderKpiCard(t("pi.monthlyRevenue", "Monthly Revenue"), formatCurrency(overview?.monthlyRevenue ?? 0), overview?.monthlyRevenueChange, DollarSign)}
              {renderKpiCard(t("pi.mrr", "MRR"), formatCurrency(overview?.mrr ?? 0), overview?.mrrChange, TrendingUp)}
              {renderKpiCard(t("pi.arr", "ARR"), formatCurrency(overview?.arr ?? 0), overview?.arrChange, TrendingUp)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {renderKpiCard(t("pi.dau", "DAU"), formatNumber(overview?.dau ?? 0), overview?.dauChange, Users)}
              {renderKpiCard(t("pi.mau", "MAU"), formatNumber(overview?.mau ?? 0), overview?.mauChange, Users)}
              {renderKpiCard(t("pi.retentionD30", "Retention D30"), `${overview?.retentionD30 ?? 0}%`, overview?.retentionD30Change, Target)}
              {renderKpiCard(t("pi.churnRate", "Churn Rate"), `${overview?.churnRate ?? 0}%`, overview?.churnRateChange, TrendingDown)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {renderKpiCard(t("pi.arpu", "ARPU"), formatCurrency(overview?.arpu ?? 0), overview?.arpuChange, DollarSign)}
              {renderKpiCard(t("pi.ltv", "LTV"), formatCurrency(overview?.ltv ?? 0), overview?.ltvChange, DollarSign)}
              {renderKpiCard(t("pi.aiCostPerGen", "AI Cost/Gen"), formatCurrency(overview?.aiCostPerGen ?? 0), overview?.aiCostPerGenChange, Brain)}
              {renderKpiCard(t("pi.growthRate", "Growth Rate"), `${overview?.growthRate ?? 0}%`, overview?.growthRateChange, Rocket)}
            </div>

            <DashboardCard title={t("pi.platformHealth", "Platform Health Score")}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("pi.healthScore", "Health Score")}</span>
                  <span className="text-2xl font-semibold">{overview?.healthScore ?? 0}/100</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted/40">
                  <div
                    className={cn(
                      "h-3 rounded-full transition-all",
                      (overview?.healthScore ?? 0) >= 80
                        ? "bg-green-500"
                        : (overview?.healthScore ?? 0) >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${overview?.healthScore ?? 0}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{t("pi.uptime", "Uptime")}: {overview?.uptime ?? "99.9%"}</span>
                  <span>{t("pi.responseTime", "Avg Response")}: {overview?.avgResponseTime ?? "120ms"}</span>
                  <span>{t("pi.errorRate", "Error Rate")}: {overview?.errorRate ?? "0.1%"}</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("pi.recentTrends", "Recent Trends")}>
              {overview?.trends && overview.trends.length > 0 ? (
                <div className="space-y-2">
                  {overview.trends.map((trend: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div className="flex items-center gap-3">
                        <Activity className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{trend.label || trend.name}</p>
                          <p className="text-xs text-muted-foreground">{trend.description || trend.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{trend.value}</span>
                        {renderTrend(trend.change)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("pi.noTrends", "No recent trends")}</p>
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.registrations", "Registrations"), formatNumber(users?.registrations ?? 0), users?.registrationsChange, Users)}
                  {renderKpiCard(t("pi.activeUsers", "Active Users"), formatNumber(users?.activeUsers ?? 0), users?.activeUsersChange, Activity)}
                  {renderKpiCard(t("pi.inactiveUsers", "Inactive Users"), formatNumber(users?.inactiveUsers ?? 0), users?.inactiveUsersChange, Minus)}
                  {renderKpiCard(t("pi.returningUsers", "Returning Users"), formatNumber(users?.returningUsers ?? 0), users?.returningUsersChange, ArrowRight)}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <DashboardCard title={t("pi.byDevice", "By Device")}>
                    {users?.byDevice && users.byDevice.length > 0 ? (
                      <div className="space-y-2">
                        {users.byDevice.map((item: any, i: number) => {
                          const maxCount = Math.max(...users.byDevice.map((d: any) => d.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-20 text-sm">{item.device || item.name}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("pi.byCountry", "By Country")}>
                    {users?.byCountry && users.byCountry.length > 0 ? (
                      <div className="space-y-2">
                        {users.byCountry.map((item: any, i: number) => {
                          const maxCount = Math.max(...users.byCountry.map((d: any) => d.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-20 text-sm">{item.country || item.name}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("pi.byLanguage", "By Language")}>
                    {users?.byLanguage && users.byLanguage.length > 0 ? (
                      <div className="space-y-2">
                        {users.byLanguage.map((item: any, i: number) => {
                          const maxCount = Math.max(...users.byLanguage.map((d: any) => d.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-20 text-sm">{item.language || item.name}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>
                </div>

                <DashboardCard title={t("pi.sessionMetrics", "Session Metrics")}>
                  {users?.sessions && users.sessions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.sessionId", "Session ID")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.user", "User")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.duration", "Duration")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.pages", "Pages")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.device", "Device")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.startedAt", "Started")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.sessions.map((s: any, i: number) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium text-xs">{s.id || s.sessionId}</td>
                              <td className="py-2 px-3">{s.user || s.userId || "-"}</td>
                              <td className="py-2 px-3">{s.duration || s.durationSeconds || "-"}</td>
                              <td className="py-2 px-3">{s.pages || s.pageViews || 0}</td>
                              <td className="py-2 px-3"><Badge tone="muted">{s.device || "-"}</Badge></td>
                              <td className="py-2 px-3 text-xs text-muted-foreground">{s.startedAt || s.createdAt || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">{t("pi.noSessions", "No session data available")}</div>
                  )}
                </DashboardCard>
              </>
            )}
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="space-y-6">
            {revenueLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.totalRevenue", "Total Revenue"), formatCurrency(revenue?.totalRevenue ?? 0), revenue?.totalRevenueChange, DollarSign)}
                  {renderKpiCard(t("pi.mrr", "MRR"), formatCurrency(revenue?.mrr ?? 0), revenue?.mrrChange, TrendingUp)}
                  {renderKpiCard(t("pi.arr", "ARR"), formatCurrency(revenue?.arr ?? 0), revenue?.arrChange, TrendingUp)}
                  {renderKpiCard(t("pi.revenueGrowth", "Revenue Growth"), `${revenue?.revenueGrowth ?? 0}%`, revenue?.revenueGrowthChange, Rocket)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("pi.revenueByCountry", "Revenue by Country")}>
                    {revenue?.byCountry && revenue.byCountry.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.country", "Country")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.revenue", "Revenue")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.users", "Users")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.share", "Share")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenue.byCountry.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">{item.country || item.name}</td>
                                <td className="py-2 px-3">{formatCurrency(item.revenue || item.amount || 0)}</td>
                                <td className="py-2 px-3">{formatNumber(item.users || item.count || 0)}</td>
                                <td className="py-2 px-3">{item.share ? `${item.share}%` : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("pi.revenueByPlan", "Revenue by Plan")}>
                    {revenue?.byPlan && revenue.byPlan.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.plan", "Plan")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.revenue", "Revenue")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.subscribers", "Subscribers")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.avgRevenue", "Avg Revenue")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenue.byPlan.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">
                                  <Badge tone={item.plan === "enterprise" ? "purple" : item.plan === "pro" ? "info" : "muted"}>
                                    {item.plan || item.name}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3">{formatCurrency(item.revenue || item.amount || 0)}</td>
                                <td className="py-2 px-3">{formatNumber(item.subscribers || item.count || 0)}</td>
                                <td className="py-2 px-3">{formatCurrency(item.avgRevenue || item.average || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">{t("pi.refunds", "Refunds")}</p>
                    <p className="mt-2 text-2xl font-semibold">{formatCurrency(revenue?.refunds ?? 0)}</p>
                    {revenue?.refundRate != null && (
                      <p className="text-xs text-muted-foreground mt-1">{t("pi.refundRate", "Rate")}: {revenue.refundRate}%</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">{t("pi.failedPayments", "Failed Payments")}</p>
                    <p className="mt-2 text-2xl font-semibold">{formatNumber(revenue?.failedPayments ?? 0)}</p>
                    {revenue?.failedPaymentRate != null && (
                      <p className="text-xs text-muted-foreground mt-1">{t("pi.failedRate", "Rate")}: {revenue.failedPaymentRate}%</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            {subscriptionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.trialConversion", "Trial Conversion"), `${subs?.trialConversion ?? 0}%`, subs?.trialConversionChange, Target)}
                  {renderKpiCard(t("pi.upgradeRate", "Upgrade Rate"), `${subs?.upgradeRate ?? 0}%`, subs?.upgradeRateChange, TrendingUp)}
                  {renderKpiCard(t("pi.downgradeRate", "Downgrade Rate"), `${subs?.downgradeRate ?? 0}%`, subs?.downgradeRateChange, TrendingDown)}
                  {renderKpiCard(t("pi.cancellationRate", "Cancellation Rate"), `${subs?.cancellationRate ?? 0}%`, subs?.cancellationRateChange, Minus)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.renewalRate", "Renewal Rate"), `${subs?.renewalRate ?? 0}%`, subs?.renewalChange, RefreshCw)}
                </div>

                <DashboardCard title={t("pi.planDistribution", "Plan Distribution")}>
                  {subs?.planDistribution && subs.planDistribution.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.plan", "Plan")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.count", "Count")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.percentage", "Percentage")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.revenue", "Revenue")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subs.planDistribution.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium">
                                <Badge tone={item.plan === "enterprise" ? "purple" : item.plan === "pro" ? "info" : "muted"}>
                                  {item.plan || item.name}
                                </Badge>
                              </td>
                              <td className="py-2 px-3">{formatNumber(item.count || item.subscribers || 0)}</td>
                              <td className="py-2 px-3">{item.percentage ? `${item.percentage}%` : "-"}</td>
                              <td className="py-2 px-3">{formatCurrency(item.revenue || item.amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                  )}
                </DashboardCard>
              </>
            )}
          </div>
        )}

        {activeTab === "credits" && (
          <div className="space-y-6">
            {creditsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.creditsPurchased", "Credits Purchased"), formatNumber(credits?.purchased ?? 0), credits?.purchasedChange, CreditCard)}
                  {renderKpiCard(t("pi.creditsUsed", "Credits Used"), formatNumber(credits?.used ?? 0), credits?.usedChange, Zap)}
                  {renderKpiCard(t("pi.creditsExpired", "Credits Expired"), formatNumber(credits?.expired ?? 0), credits?.expiredChange, Minus)}
                  {renderKpiCard(t("pi.creditsRefunded", "Credits Refunded"), formatNumber(credits?.refunded ?? 0), credits?.refundedChange, TrendingDown)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.avgCreditsPerUser", "Avg Credits/User"), formatNumber(credits?.avgPerUser ?? 0), null, Users)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("pi.creditsByPlan", "Credits by Plan")}>
                    {credits?.byPlan && credits.byPlan.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.plan", "Plan")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.purchased", "Purchased")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.used", "Used")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.remaining", "Remaining")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {credits.byPlan.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">{item.plan || item.name}</td>
                                <td className="py-2 px-3">{formatNumber(item.purchased || 0)}</td>
                                <td className="py-2 px-3">{formatNumber(item.used || 0)}</td>
                                <td className="py-2 px-3">{formatNumber(item.remaining ?? ((item.purchased || 0) - (item.used || 0)))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("pi.creditsByModel", "Credits by AI Model")}>
                    {credits?.byModel && credits.byModel.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.model", "Model")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.used", "Used")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.cost", "Cost")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {credits.byModel.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">{item.model || item.name}</td>
                                <td className="py-2 px-3">{formatNumber(item.used || item.credits || 0)}</td>
                                <td className="py-2 px-3">{formatCurrency(item.cost || item.amount || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "ai" && (
          <div className="space-y-6">
            {aiLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.aiRequests", "AI Requests"), formatNumber(aiMetrics?.totalRequests ?? 0), aiMetrics?.requestsChange, Brain)}
                  {renderKpiCard(t("pi.aiSuccessRate", "Success Rate"), `${aiMetrics?.successRate ?? 0}%`, aiMetrics?.successRateChange, Target)}
                  {renderKpiCard(t("pi.aiFailureRate", "Failure Rate"), `${aiMetrics?.failureRate ?? 0}%`, aiMetrics?.failureRateChange, TrendingDown)}
                  {renderKpiCard(t("pi.aiAvgCost", "Avg Cost"), formatCurrency(aiMetrics?.avgCost ?? 0), aiMetrics?.avgCostChange, DollarSign)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.aiAvgLatency", "Avg Latency"), `${aiMetrics?.avgLatency ?? 0}ms`, aiMetrics?.latencyChange, Activity)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("pi.providerUsage", "Provider Usage")}>
                    {aiMetrics?.byProvider && aiMetrics.byProvider.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.provider", "Provider")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.requests", "Requests")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.cost", "Cost")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.latency", "Latency")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiMetrics.byProvider.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">{item.provider || item.name}</td>
                                <td className="py-2 px-3">{formatNumber(item.requests || item.count || 0)}</td>
                                <td className="py-2 px-3">{formatCurrency(item.cost || item.amount || 0)}</td>
                                <td className="py-2 px-3">{item.latency || item.avgLatency || "-"}ms</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("pi.modelUsage", "Model Usage")}>
                    {aiMetrics?.byModel && aiMetrics.byModel.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.model", "Model")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.requests", "Requests")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.cost", "Cost")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.quality", "Quality")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiMetrics.byModel.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">{item.model || item.name}</td>
                                <td className="py-2 px-3">{formatNumber(item.requests || item.count || 0)}</td>
                                <td className="py-2 px-3">{formatCurrency(item.cost || item.amount || 0)}</td>
                                <td className="py-2 px-3">
                                  <Badge tone={item.quality >= 90 ? "success" : item.quality >= 70 ? "info" : "warning"}>
                                    {item.quality ?? "-"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                    )}
                  </DashboardCard>
                </div>

                <DashboardCard title={t("pi.qualityScores", "Quality Scores")}>
                  {aiMetrics?.qualityScores && aiMetrics.qualityScores.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {aiMetrics.qualityScores.map((item: any, i: number) => (
                        <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs text-muted-foreground">{item.metric || item.name}</p>
                          <p className="mt-2 text-2xl font-semibold">{item.score ?? item.value ?? 0}</p>
                          {item.benchmark != null && (
                            <p className="text-xs text-muted-foreground mt-1">{t("pi.benchmark", "Benchmark")}: {item.benchmark}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
                  )}
                </DashboardCard>
              </>
            )}
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-6">
            {featuresLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {features.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feat: any, i: number) => (
                      <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {feat.name || feat.feature}
                          </span>
                          {renderTrend(feat.trend)}
                        </div>
                        <p className="text-2xl font-semibold">{formatNumber(feat.usage || feat.count || 0)}</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min(feat.adoptionRate ?? feat.adoption ?? 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{feat.adoptionRate ?? feat.adoption ?? 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: "imageStudio", icon: Eye },
                      { key: "videoStudio", icon: Layout },
                      { key: "affiliateStudio", icon: Target },
                      { key: "dramaStudio", icon: FileText },
                      { key: "automation", icon: Zap },
                      { key: "publishing", icon: Globe },
                    ].map(({ key, icon: Icon }) => (
                      <div key={key} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {t(`pi.feature.${key}`, key.replace(/([A-Z])/g, " $1").trim())}
                            </span>
                          </div>
                        </div>
                        <p className="text-2xl font-semibold">{t("common.noData", "N/A")}</p>
                        <p className="text-xs text-muted-foreground">{t("pi.noFeatureData", "No feature data available")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "funnels" && (
          <div className="space-y-6">
            {funnelsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {funnels.length > 0 ? (
                  funnels.map((funnel: any, fi: number) => (
                    <DashboardCard key={fi} title={funnel.name || `${t("pi.funnel", "Funnel")} ${fi + 1}`}>
                      <div className="space-y-3">
                        {(funnel.stages || []).map((stage: any, si: number) => {
                          const maxUsers = funnel.stages?.[0]?.users || 1;
                          const width = Math.max(((stage.users || 0) / maxUsers) * 100, 5);
                          return (
                            <div key={si} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{stage.name || stage.label || `${t("pi.stage", "Stage")} ${si + 1}`}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground">{formatNumber(stage.users || 0)}</span>
                                  {si > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {stage.dropoff != null
                                        ? `${stage.dropoff}% ${t("pi.dropoff", "dropoff")}`
                                        : stage.conversion != null
                                        ? `${stage.conversion}% ${t("pi.conversion", "conversion")}`
                                        : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="h-8 rounded-lg bg-muted/40 overflow-hidden">
                                <div
                                  className="h-8 rounded-lg bg-primary/80 flex items-center px-3"
                                  style={{ width: `${width}%` }}
                                >
                                  <span className="text-xs text-primary-foreground font-medium">
                                    {stage.rate != null ? `${stage.rate}%` : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </DashboardCard>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Filter className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("pi.noFunnels", "No funnel data available")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "retention" && (
          <div className="space-y-6">
            {retentionLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.retentionD1", "D1 Retention"), `${retention?.d1 ?? 0}%`, retention?.d1Change, Target)}
                  {renderKpiCard(t("pi.retentionD7", "D7 Retention"), `${retention?.d7 ?? 0}%`, retention?.d7Change, Target)}
                  {renderKpiCard(t("pi.retentionD30", "D30 Retention"), `${retention?.d30 ?? 0}%`, retention?.d30Change, Target)}
                  {renderKpiCard(t("pi.retentionD90", "D90 Retention"), `${retention?.d90 ?? 0}%`, retention?.d90Change, Target)}
                </div>

                <DashboardCard title={t("pi.cohortRetention", "Cohort Retention")}>
                  {retention?.cohorts && retention.cohorts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.cohort", "Cohort")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.users", "Users")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.d1", "D1")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.d7", "D7")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.d30", "D30")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.d90", "D90")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {retention.cohorts.map((cohort: any, i: number) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium">{cohort.cohort || cohort.label || cohort.date}</td>
                              <td className="py-2 px-3">{formatNumber(cohort.users || 0)}</td>
                              {["d1", "d7", "d30", "d90"].map((d) => (
                                <td key={d} className="py-2 px-3">
                                  <Badge
                                    tone={
                                      (cohort[d] ?? 0) >= 70
                                        ? "success"
                                        : (cohort[d] ?? 0) >= 40
                                        ? "warning"
                                        : "default"
                                    }
                                  >
                                    {cohort[d] ?? 0}%
                                  </Badge>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">{t("pi.noCohortData", "No cohort retention data")}</div>
                  )}
                </DashboardCard>
              </>
            )}
          </div>
        )}

        {activeTab === "churn" && (
          <div className="space-y-6">
            {churnLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.churnRate", "Churn Rate"), `${churn?.churnRate ?? 0}%`, churn?.churnRateChange, TrendingDown)}
                  {renderKpiCard(t("pi.churnedUsers", "Churned Users"), formatNumber(churn?.churnedUsers ?? 0), churn?.churnedUsersChange, Users)}
                  {renderKpiCard(t("pi.churnedRevenue", "Churned Revenue"), formatCurrency(churn?.churnedRevenue ?? 0), churn?.churnedRevenueChange, DollarSign)}
                  {renderKpiCard(t("pi.saveRate", "Save Rate"), `${churn?.saveRate ?? 0}%`, churn?.saveRateChange, Target)}
                </div>

                <DashboardCard title={t("pi.churnReasons", "Churn Reasons")}>
                  {churn?.reasons && churn.reasons.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.reason", "Reason")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.count", "Count")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.percentage", "Percentage")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {churn.reasons.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium">{item.reason || item.name}</td>
                              <td className="py-2 px-3">{formatNumber(item.count || 0)}</td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-24 rounded-full bg-muted/40">
                                    <div
                                      className="h-2 rounded-full bg-primary"
                                      style={{ width: `${item.percentage ?? ((item.count || 0) / Math.max(churn.churnedUsers || 1, 1)) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{item.percentage ? `${item.percentage}%` : ""}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <TrendingDown className="mb-3 size-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">{t("pi.noChurnData", "No churn reason data")}</p>
                    </div>
                  )}
                </DashboardCard>
              </>
            )}
          </div>
        )}

        {activeTab === "segments" && (
          <div className="space-y-6">
            {segmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : segments.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {segments.map((seg: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {seg.name || seg.segment}
                      </span>
                      <Badge tone="info">{seg.type || "custom"}</Badge>
                    </div>
                    <p className="text-2xl font-semibold">{formatNumber(seg.userCount ?? seg.users ?? seg.count ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">{seg.description || seg.criteria || ""}</p>
                    {seg.revenue != null && (
                      <p className="text-xs text-muted-foreground">{t("pi.revenue", "Revenue")}: {formatCurrency(seg.revenue)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t("pi.noSegments", "No customer segments")}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "publishing" && (
          <div className="space-y-6">
            {publishingLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderKpiCard(t("pi.totalPublished", "Total Published"), formatNumber(publishing?.totalPublished ?? 0), publishing?.publishedChange, Globe)}
                  {renderKpiCard(t("pi.publishSuccessRate", "Success Rate"), `${publishing?.successRate ?? 0}%`, publishing?.successRateChange, Target)}
                  {renderKpiCard(t("pi.publishFailureRate", "Failure Rate"), `${publishing?.failureRate ?? 0}%`, publishing?.failureRateChange, TrendingDown)}
                  {renderKpiCard(t("pi.pendingPublish", "Pending"), formatNumber(publishing?.pending ?? 0), null, Activity)}
                </div>

                <DashboardCard title={t("pi.publishingByPlatform", "Publishing by Platform")}>
                  {publishing?.byPlatform && publishing.byPlatform.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.platform", "Platform")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.published", "Published")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.success", "Success")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.failed", "Failed")}</th>
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.successRate", "Rate")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {publishing.byPlatform.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-2 px-3 font-medium">{item.platform || item.name}</td>
                              <td className="py-2 px-3">{formatNumber(item.published || item.count || 0)}</td>
                              <td className="py-2 px-3 text-green-600 dark:text-green-400">{formatNumber(item.success || 0)}</td>
                              <td className="py-2 px-3 text-red-600 dark:text-red-400">{formatNumber(item.failed || 0)}</td>
                              <td className="py-2 px-3">
                                <Badge tone={item.successRate >= 90 ? "success" : item.successRate >= 70 ? "warning" : "default"}>
                                  {item.successRate ?? 0}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Globe className="mb-3 size-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">{t("pi.noPublishData", "No publishing data available")}</p>
                    </div>
                  )}
                </DashboardCard>
              </>
            )}
          </div>
        )}

        {activeTab === "forecasts" && (
          <div className="space-y-6">
            {forecastsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {forecasts.length > 0 ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {forecasts.slice(0, 6).map((fc: any, i: number) => (
                        <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {fc.metric || fc.name || fc.type}
                            </span>
                            <Rocket className="size-4 text-muted-foreground" />
                          </div>
                          <p className="text-2xl font-semibold">{fc.predictedValue ?? fc.predicted ?? fc.projectedValue ?? 0}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{t("pi.confidence", "Confidence")}: {fc.confidence ?? 0}%</span>
                            <span>|</span>
                            <span>{fc.period || fc.date || fc.targetDate || "-"}</span>
                          </div>
                          {fc.range && (
                            <p className="text-xs text-muted-foreground">
                              {t("pi.range", "Range")}: {fc.range.low} - {fc.range.high}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <DashboardCard title={t("pi.twelveMonthForecast", "12-Month Forecast")}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.month", "Month")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.predicted", "Predicted")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.low", "Low")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.high", "High")}</th>
                              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.confidence", "Confidence")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forecasts.map((fc: any, i: number) => (
                              <tr key={i} className="border-b border-border/50">
                                <td className="py-2 px-3 font-medium">{fc.month || fc.period || fc.date || `M+${i + 1}`}</td>
                                <td className="py-2 px-3">{formatNumber(fc.predictedValue ?? fc.predicted ?? fc.value ?? 0)}</td>
                                <td className="py-2 px-3 text-muted-foreground">{fc.range?.low ?? fc.low ?? "-"}</td>
                                <td className="py-2 px-3 text-muted-foreground">{fc.range?.high ?? fc.high ?? "-"}</td>
                                <td className="py-2 px-3">
                                  <Badge tone={fc.confidence >= 80 ? "success" : fc.confidence >= 60 ? "warning" : "default"}>
                                    {fc.confidence ?? 0}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </DashboardCard>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Rocket className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("pi.noForecasts", "No forecast data available")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "decisions" && (
          <div className="space-y-6">
            {decisionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : decisions.length > 0 ? (
              <div className="space-y-3">
                {decisions.map((decision: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{decision.title || decision.name || decision.action}</p>
                          <Badge tone={decision.priority === "high" || decision.priority === "critical" ? "default" : decision.priority === "medium" ? "warning" : "muted"}>
                            {decision.priority || "info"}
                          </Badge>
                          <Badge tone={decision.status === "approved" || decision.status === "completed" ? "success" : decision.status === "pending" ? "warning" : "info"}>
                            {decision.status || "pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{decision.rationale || decision.description || decision.reason}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-muted-foreground">{t("pi.confidence", "Confidence")}</p>
                        <p className="text-lg font-semibold">{decision.confidence ?? 0}%</p>
                      </div>
                    </div>
                    {decision.impact && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="size-3" />
                        <span>{t("pi.impact", "Impact")}: {decision.impact}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Settings className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t("pi.noDecisions", "No decision recommendations")}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            {reportsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DashboardCard title={t("pi.generatedReports", "Generated Reports")}>
                {reports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.reportName", "Report")}</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.type", "Type")}</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.period", "Period")}</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("pi.generatedAt", "Generated")}</th>
                          <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report: any, i: number) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2 px-3 font-medium">{report.name || report.title}</td>
                            <td className="py-2 px-3">
                              <Badge tone="muted">{report.type || "general"}</Badge>
                            </td>
                            <td className="py-2 px-3">{report.period || report.dateRange || "-"}</td>
                            <td className="py-2 px-3">
                              <Badge tone={report.status === "completed" || report.status === "ready" ? "success" : report.status === "generating" ? "warning" : "muted"}>
                                {report.status || "ready"}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-xs text-muted-foreground">
                              {report.generatedAt || report.createdAt || "-"}
                            </td>
                            <td className="py-2 px-3">
                              <Button variant="ghost" size="sm">
                                <Download className="size-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("pi.noReports", "No reports generated")}</p>
                  </div>
                )}
              </DashboardCard>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
