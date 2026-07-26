"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { StatisticsCards, type StatCard } from "@/components/dashboard/StatisticsCards";
import { HealthPanel, type HealthStatus } from "@/components/dashboard/HealthPanel";
import { AnalyticsPanel, type AnalyticsMetric } from "@/components/dashboard/AnalyticsPanel";
import { AuditLogs, type AuditLogEntry } from "@/components/dashboard/AuditLogs";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { TrendingUp, Users, Zap, Activity } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

export default function AdminDashboardRootPage() {
  const { t } = useLocalizationContext();

  const formatAuditAction = (action: string, user?: string) => {
    if (!action) return "—";
    const key = action.replace(/\./g, "");
    const translated = t(`admin.auditLogs.${key}`, action);
    if (action === "user.login" && user) {
      return `${user} - ${translated}`;
    }
    return translated;
  };

  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (mounted) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/admin/stats", { cache: "no-store" })
          .then((r) => {
            if (!r.ok) throw new Error(`API error: ${r.status}`);
            return r.json();
          })
          .then((data) => {
            if (mounted) {
              setStats(data);
              setError(null);
            }
          })
          .catch((err) => {
            if (mounted) setError(err instanceof Error ? err.message : "Failed to load stats");
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      }
    };

    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (mounted) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load stats");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Format relative time
  const formatRelativeTime = (date?: Date | string) => {
    if (!date) return "moments ago";
    const d = typeof date === "string" ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return "moments ago";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <AdminShell>
        <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
          <DashboardSkeleton />
        </PageLayout>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
          <ErrorState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </PageLayout>
      </AdminShell>
    );
  }

  // Prepare statistics cards
  const statisticsCards: StatCard[] = [
    {
      id: "users",
      title: t("admin.users"),
      value: formatNumber(stats?.users?.total ?? 0),
      icon: Users,
      variant: "success",
      trend: {
        value: stats?.users?.growth ?? 0,
        label: "this month",
        direction: stats?.users?.growth ?? 0 >= 0 ? "up" : "down",
      },
    },
    {
      id: "workspaces",
      title: t("admin.workspaces"),
      value: formatNumber(stats?.workspaces?.total ?? 0),
      icon: Activity,
      variant: "info",
      subtitle: `${stats?.workspaces?.active ?? 0} active`,
    },
    {
      id: "jobs",
      title: t("admin.jobs"),
      value: formatNumber(stats?.jobs?.total ?? 0),
      icon: Zap,
      variant: "warning",
      subtitle: `${stats?.jobs?.queued ?? 0} queued, ${stats?.jobs?.running ?? 0} running`,
    },
    {
      id: "revenue",
      title: t("admin.revenue"),
      value: formatCurrency(stats?.revenue?.total ?? 0),
      icon: TrendingUp,
      variant: "success",
      trend: {
        value: stats?.revenue?.growth ?? stats?.users?.growth ?? 0,
        label: "vs last month",
        direction: (stats?.revenue?.growth ?? stats?.users?.growth ?? 0) >= 0 ? "up" : "down",
      },
    },
  ];

  // Prepare health status items
  const healthItems: HealthStatus[] = [
    {
      id: "api",
      label: "API",
      status: (stats?.system?.api === "Online" ? "healthy" : "critical") as any,
      detail: t("admin.system.allEndpoints", "All endpoints responding"),
    },
    {
      id: "database",
      label: "Database",
      status: (stats?.system?.database === "Online" ? "healthy" : "critical") as any,
      detail: t("admin.database.connected", "Connected and responsive"),
    },
    {
      id: "queue",
      label: "Job Queue",
      status: (stats?.jobs?.failed === 0 ? "healthy" : "warning") as any,
      detail: stats?.jobs?.failed ? `${stats.jobs.failed} failures` : t("admin.jobQueue.healthy", "No errors"),
    },
    {
      id: "workers",
      label: "Workers",
      status: "running",
      detail: `${stats?.jobs?.running ?? 0} active`,
    },
    {
      id: "storage",
      label: "Storage",
      status: "healthy",
      detail: t("admin.storage.healthy", "85% capacity"),
    },
  ];

  // Prepare analytics metrics
  const analyticsMetrics: AnalyticsMetric[] = [
    {
      id: "registrations",
      label: "New Users",
      value: formatNumber(stats?.analytics?.newRegistrations ?? 0),
      trend: 12,
    },
    {
      id: "credits",
      label: "Credits Used",
      value: formatNumber(stats?.analytics?.creditsUsed ?? 0),
      unit: "tokens",
      trend: 8,
    },
    {
      id: "errors",
      label: "Failed Jobs",
      value: stats?.jobs?.failed ?? 0,
      variant: "critical",
      trend: -5,
    },
    {
      id: "performance",
      label: "Avg Job Time",
      value: `${stats?.analytics?.avgJobTime ?? 0}`,
      unit: "ms",
      trend: -10,
    },
  ];

  // Prepare audit logs
  const auditLogs: AuditLogEntry[] = (stats?.auditLogs ?? []).map((log: any) => {
    let actionType: "create" | "update" | "delete" | "view" | "login" | "logout" = "view";
    if (log.action?.includes("create") || log.action?.includes("new")) {
      actionType = "create";
    } else if (log.action?.includes("update") || log.action?.includes("modify")) {
      actionType = "update";
    } else if (log.action?.includes("delete")) {
      actionType = "delete";
    } else if (log.action?.includes("login")) {
      actionType = "login";
    } else if (log.action?.includes("logout")) {
      actionType = "logout";
    }

    return {
      id: log.id,
      user: log.user,
      action: formatAuditAction(log.action, log.user),
      actionType,
      timestamp: formatRelativeTime(log.createdAt),
      ipAddress: log.ipAddress,
      details: log.details,
    };
  });

  return (
    <AdminShell>
      <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
        <div className="space-y-6">
          {/* Hero Section */}
          <DashboardHero
            title={t("admin.dashboard")}
            description={t("admin.dashboardDescription", "Manage your AI platform in real time")}
             environment={t("admin.system", "System Health")}
            lastUpdated={formatRelativeTime(new Date())}
            systemStatus={stats?.jobs?.failed ? "warning" : "healthy"}
          />

          {/* Statistics Cards */}
          <StatisticsCards cards={statisticsCards} columns={4} />

          {/* Three-Column Grid: Health + Analytics + Audit Logs */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {/* Health Panel */}
            <HealthPanel
              title={t("admin.system", "System Health")}
              items={healthItems}
            />

            {/* Analytics Panel */}
            <AnalyticsPanel
              title={t("admin.analytics.label", "Analytics")}
              description={t("admin.analytics.description", "Key metrics and performance indicators")}
              metrics={analyticsMetrics}
              hasChart={true}
              chartHeight="md"
            />

            {/* Audit Logs */}
            <AuditLogs
              title={t("admin.auditLogs.label", "Recent Activity")}
              entries={auditLogs}
              emptyMessage={t("admin.auditLogs.empty", "No recent activity")}
              emptyDescription={t(
                "admin.auditLogs.emptyDescription",
                "Your audit logs will appear here once users begin interacting with the platform."
              )}
              maxItems={5}
              onViewMore={() => {
                // Navigate to audit logs page
                window.location.href = "/admin/(protected)/audit-logs";
              }}
            />
          </div>
        </div>
      </PageLayout>
    </AdminShell>
  );
}
