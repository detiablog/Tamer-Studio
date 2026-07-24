"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { TrendingUp, Users, Zap, Activity } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

export default function AdminDashboardRootPage() {
  const { t } = useLocalizationContext();

  return (
    <AdminShell>
      <PageLayout title={t("admin.dashboard")} breadcrumb={[{ label: t("admin.dashboard") }]}>
        <div className="space-y-8">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{t("admin.dashboard")}</h2>
              <p className="text-muted-foreground">{t("admin.description")}</p>
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
                  <p className="text-3xl font-bold">1,234</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    +12% this week
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
                  <p className="text-3xl font-bold">45</p>
                  <p className="text-xs text-muted-foreground">71% of total capacity</p>
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
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-xs text-muted-foreground">Processing in queue</p>
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
                  <p className="text-3xl font-bold">$12,500</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    +8.2% vs last month
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
                    <div className="size-2 rounded-full bg-green-600" />
                    <span className="text-xs text-green-600 font-medium">Healthy</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">API Uptime</span>
                      <span className="text-xs font-semibold">99.98%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[99.98%] bg-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Database</span>
                      <span className="text-xs font-semibold">Online</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Cache</span>
                      <span className="text-xs font-semibold">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[94%] bg-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{t("admin.analytics")}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.users")}</span>
                    <span className="text-sm font-semibold">234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.apiRateLimit")}</span>
                    <span className="text-sm font-semibold">45.2K/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.errors")}</span>
                    <span className="text-sm font-semibold text-amber-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("admin.performance")}</span>
                    <span className="text-sm font-semibold">245ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{t("admin.auditLogs")}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium">{t("admin.newUser")}</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-green-600 mt-1.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium">{t("admin.workspaceCreated")}</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium">{t("admin.jobFailed")}</p>
                      <p className="text-xs text-muted-foreground">32 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </AdminShell>
  );
}