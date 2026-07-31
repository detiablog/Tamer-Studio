"use client";

import * as React from "react";
import useSWR from "swr";
import { logger } from "@/core/logger";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Clock, Activity, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      logger.error(`[Fetcher] Failed to fetch ${url}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    });

export default function AdminDashboardPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const { data, error, isLoading, mutate } = useSWR("/api/admin/stats", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState(Date.now());

  const stats = React.useMemo(() => {
    if (data?.success && data.data) return data.data;
    return null;
  }, [data]);

  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      mutate();
      setLastRefresh(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, mutate]);

  const handleRefresh = () => {
    mutate();
    setLastRefresh(Date.now());
    toast.success(t("admin.dashboardRefreshed", "Dashboard refreshed"));
  };

  const handleCardClick = (title: string) => {
    const routes: Record<string, string> = {
      [t("admin.totalUsers", "Total Users")]: "/admin/users",
      [t("admin.activeWorkspaces", "Active Workspaces")]: "/admin/workspaces",
      [t("admin.activeJobs", "Active Jobs")]: "/admin/jobs",
      [t("admin.revenue", "Revenue")]: "/admin/billing",
    };
    const route = routes[title];
    if (route) {
      window.location.href = route;
    } else {
      toast.info(t("admin.viewingDetails", "Viewing details for").concat(" ").concat(title));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.dashboard", "Admin Dashboard")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.dashboardDescription", "Platform overview and recent activity")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted/40" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-muted/40" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted/40" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-muted/40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 animate-pulse rounded bg-muted/20" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.dashboard", "Admin Dashboard")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.dashboardDescription", "Platform overview and recent activity")}</p>
        </div>
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message || t("admin.dashboardLoadError", "Could not load dashboard stats")}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("admin.dashboard", "Admin Dashboard")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.dashboardDescription", "Platform overview and recent activity")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {Math.round((Date.now() - lastRefresh) / 1000)}s {t("admin.ago", "ago")}
          </div>
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)} className={autoRefresh ? "bg-primary/10 text-primary" : ""}>
            <Activity className="mr-2 size-4" />
            {autoRefresh ? t("admin.autoOn", "Auto ON") : t("admin.autoOff", "Auto OFF")}
          </Button>
          <Button size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: t("admin.totalUsers", "Total Users"), value: stats?.totalUsers ?? 0, delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +12% {t("admin.thisWeek", "this week")}</span>, href: "/admin/users" },
          { title: t("admin.activeWorkspaces", "Active Workspaces"), value: stats?.activeWorkspaces ?? 0, delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +5 {t("admin.thisWeek", "this week")}</span>, href: "/admin/workspaces" },
          { title: t("admin.activeJobs", "Active Jobs"), value: stats?.activeJobs ?? stats?.jobs?.processing ?? 0, delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowDownRight className="size-3" /> -3 {t("admin.fromYesterday", "from yesterday")}</span>, href: "/admin/jobs" },
          { title: t("admin.revenue", "Revenue"), value: formatCurrency(stats?.revenue ?? 0), delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +8.2% {t("admin.vsLastMonth", "vs last month")}</span>, href: "/admin/billing" },
        ].map((stat) => (
          <div key={stat.title} className="cursor-pointer" onClick={() => handleCardClick(stat.title)}>
            <StatCard title={stat.title} value={stat.value} delta={stat.delta} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title={t("admin.revenueOverview", "Revenue Overview")} description={t("admin.revenueOverviewDesc", "Platform revenue for the last 7 days")}>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: t("admin.today", "Today"), value: formatCurrency(stats?.revenueToday ?? 0), change: stats?.revenueTodayChange ?? "+5.2%" },
              { label: t("admin.thisWeek", "This Week"), value: formatCurrency(stats?.revenueWeek ?? 0), change: stats?.revenueWeekChange ?? "+12.1%" },
              { label: t("admin.thisMonth", "This Month"), value: formatCurrency(stats?.revenueMonth ?? stats?.revenue ?? 0), change: stats?.revenueMonthChange ?? "+8.2%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="size-3" />
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title={t("admin.productionJobs", "Production Jobs")} description={t("admin.productionJobsDesc", "Recent jobs across all workspaces")}>
          <div className="space-y-3">
            {stats?.recentJobs?.length > 0 ? stats.recentJobs.slice(0, 5).map((job: any) => (
              <div key={job.id || job.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{job.name}</h4>
                    <Badge
                      tone={
                        job.status === "Running"
                          ? "info"
                          : job.status === "Completed"
                            ? "success"
                            : job.status === "Queued"
                              ? "muted"
                              : "default"
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                  {job.owner && <p className="text-xs text-muted-foreground mt-1">{t("admin.owner", "Owner")}: {job.owner}</p>}
                  {job.progress != null && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t("admin.noRecentJobs", "No recent jobs to display")}
              </div>
            )}
          </div>
          <div className="mt-4">
            <Link href="/admin/jobs" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">
              {t("admin.viewAllJobs", "View all jobs")}
            </Link>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
