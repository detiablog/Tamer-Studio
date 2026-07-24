"use client";

import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

export default function AdminDashboardPage() {
  const { t } = useLocalizationContext();
  const [metrics, setMetrics] = React.useState({
    totalUsers: 1234,
    activeWorkspaces: 45,
    revenue: "$12,500",
    revenueToday: "$850",
    revenueWeek: "$5,200",
    revenueMonth: "$12,500",
  });

  const [jobs, setJobs] = React.useState({ processing: 8 });
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState(Date.now());

  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 5) - 1,
        revenueToday: `$${(850 + Math.floor(Math.random() * 100)).toLocaleString()}`,
      }));
      setLastRefresh(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    toast.success(t("admin.dashboardRefreshed", "Dashboard refreshed"));
    setLastRefresh(Date.now());
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
      toast.info(t("admin.viewingDetails", `Viewing {0} details`).replace("{0}", title));
    }
  };

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
          { title: t("admin.totalUsers", "Total Users"), value: metrics.totalUsers ?? 0, delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +12% {t("admin.thisWeek", "this week")}</span>, href: "/admin/users" },
          { title: t("admin.activeWorkspaces", "Active Workspaces"), value: metrics.activeWorkspaces ?? 0, delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +5 {t("admin.thisWeek", "this week")}</span>, href: "/admin/workspaces" },
          { title: t("admin.activeJobs", "Active Jobs"), value: jobs.processing ?? 0, delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowDownRight className="size-3" /> -3 {t("admin.fromYesterday", "from yesterday")}</span>, href: "/admin/jobs" },
          { title: t("admin.revenue", "Revenue"), value: metrics.revenue ?? "$0", delta: <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +8.2% {t("admin.vsLastMonth", "vs last month")}</span>, href: "/admin/billing" },
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
              { label: t("admin.today", "Today"), value: metrics.revenueToday ?? "$0", change: "+5.2%" },
              { label: t("admin.thisWeek", "This Week"), value: metrics.revenueWeek ?? "$0", change: "+12.1%" },
              { label: t("admin.thisMonth", "This Month"), value: metrics.revenueMonth ?? "$0", change: "+8.2%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleCardClick(stat.label)}>
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
            {[
              { name: "Hero Video Render", status: "Running", progress: 72, owner: "Alice Johnson" },
              { name: "Product Image Batch", status: "Queued", progress: 0, owner: "Bob Smith" },
              { name: "Voiceover Generation", status: "Running", progress: 45, owner: "Carol White" },
            ].map((job) => (
              <div key={job.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleCardClick(job.name)}>
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
                  <p className="text-xs text-muted-foreground mt-1">{t("admin.owner", "Owner")}: {job.owner}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
                <Link href="/admin/jobs" className="text-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                  {t("common.view", "Details")}
                </Link>
              </div>
            ))}
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
