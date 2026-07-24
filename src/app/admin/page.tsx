"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { TrendingUp, Users, Zap, Activity, Loader } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      console.error(`[Fetcher] Failed to fetch ${url}:`, error);
      throw error;
    });

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

  if (loading) {
    return (
      <AdminShell>
        <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
          <div className="flex items-center justify-center py-20">
            <Loader className="size-8 animate-spin text-muted-foreground" />
          </div>
        </PageLayout>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
          <div className="text-center py-20">
            <p className="text-destructive">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary hover:underline">
              Retry
            </button>
          </div>
        </PageLayout>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
        <div className="space-y-8">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{t("admin.dashboard")}</h2>
              <p className="text-muted-foreground">{t("admin.dashboardDescription", "Platform overview and recent activity")}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition hover:border-primary/30 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t("admin.users")}</span>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="size-4 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{formatNumber(stats?.users?.total ?? 0)}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    +{stats?.users?.growth ?? 0}% this month
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition hover:border-primary/30 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t("admin.workspaces")}</span>
                  <div className="rounded-lg bg-blue-600/10 p-2">
                    <Activity className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{formatNumber(stats?.workspaces?.total ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">{stats?.workspaces?.active ?? 0} active</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition hover:border-primary/30 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t("admin.jobs")}</span>
                  <div className="rounded-lg bg-amber-600/10 p-2">
                    <Zap className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{formatNumber(stats?.jobs?.total ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">{stats?.jobs?.queued ?? 0} queued, {stats?.jobs?.running ?? 0} running</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition hover:border-primary/30 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t("admin.revenue")}</span>
                  <div className="rounded-lg bg-green-600/10 p-2">
                    <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{formatCurrency(stats?.revenue?.total ?? 0)}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    +{stats?.users?.growth ?? 0}% vs last month
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t("admin.jobs")}</h3>
                  <div className="flex gap-1">
                    <div className={`size-2 rounded-full ${(stats?.jobs?.failed ?? 0) > 0 ? "bg-amber-600" : "bg-green-600"}`} />
                    <span className="text-xs text-green-600 font-medium">{(stats?.jobs?.failed ?? 0) === 0 ? "Healthy" : "Issues"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t("admin.apiUptime", "API Uptime")}</span>
                      <span className="text-xs font-semibold">{stats?.system?.uptime ?? "99.9%"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[99.9%] bg-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t("admin.system")}</span>
                      <span className="text-xs font-semibold">{stats?.system?.database ?? "Online"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t("admin.apiRateLimit")}</span>
                      <span className="text-xs font-semibold">{stats?.system?.api ?? "Online"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{t("admin.analytics.label")}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.users")}</span>
                    <span className="text-sm font-semibold">{formatNumber(stats?.analytics?.newRegistrations ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.apiRateLimit")}</span>
                    <span className="text-sm font-semibold">{formatNumber(stats?.analytics?.creditsUsed ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.errors")}</span>
                    <span className="text-sm font-semibold text-amber-600">{stats?.jobs?.failed ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.performance")}</span>
                    <span className="text-sm font-semibold">{stats?.analytics?.avgJobTime ?? 0}ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{t("admin.auditLogs.label")}</h3>
                <div className="space-y-3">
                  {stats?.auditLogs?.length > 0 ? (
                    stats.auditLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <div className={`size-2 rounded-full mt-1.5 shrink-0 ${
                          log.action?.includes("create") || log.action?.includes("new") ? "bg-blue-600" :
                          log.action?.includes("delete") || log.action?.includes("fail") ? "bg-red-600" :
                          "bg-green-600"
                        }`} />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-medium truncate">{formatAuditAction(log.action, log.user)}</p>
                          <p className="text-xs text-muted-foreground">{log.createdAt}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("admin.auditLogs.empty", "No recent activity")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </AdminShell>
  );
}