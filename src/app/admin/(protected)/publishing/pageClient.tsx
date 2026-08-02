"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { StatCard } from "@/components/ui/StatCard";
import {
  Search,
  Loader,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  RefreshCw,
  Activity,
  Users,
  Share2,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

const STATUS_COLORS: Record<string, string> = {
  published: "success",
  scheduled: "info",
  draft: "muted",
  failed: "destructive",
  cancelled: "warning",
  publishing: "info",
  connected: "success",
  disconnected: "warning",
  healthy: "success",
  degraded: "warning",
  offline: "destructive",
};

export function PublishingAdminPageClient() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const { data: statsData, isLoading: statsLoading } = useSWR("/api/publishing/admin/stats", fetcher);
  const { data: queueData, isLoading: queueLoading } = useSWR("/api/publishing/admin/queue", fetcher);
  const { data: healthData, isLoading: healthLoading } = useSWR("/api/publishing/admin/health", fetcher);
  const { data: logsData, isLoading: logsLoading } = useSWR("/api/publishing/admin/logs", fetcher);

  const stats = statsData?.data ?? {};
  const queue = queueData?.data ?? [];
  const health = healthData?.data ?? [];
  const logs = logsData?.data ?? [];

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log: any) => {
      const matchSearch = !search || (log.title || log.caption || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, search, statusFilter]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.publishing", "Publishing") }]} />

      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("publishing.title", "Publishing Hub")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("publishing.description", "Publish your AI-generated content to social media")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
          <StatCard
            title={t("publishing.admin.totalPosts", "Total Posts")}
            value={stats.totalPosts ?? 0}
          />
          <StatCard
            title={t("publishing.admin.published", "Published")}
            value={stats.published ?? 0}
          />
          <StatCard
            title={t("publishing.admin.scheduled", "Scheduled")}
            value={stats.scheduled ?? 0}
          />
          <StatCard
            title={t("publishing.admin.failed", "Failed")}
            value={stats.failed ?? 0}
          />
          <StatCard
            title={t("publishing.admin.connectedAccounts", "Connected Accounts")}
            value={stats.connectedAccounts ?? 0}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <DashboardCard title={t("publishing.admin.platformHealth", "Platform Health")}>
            {healthLoading ? (
              <div className="flex items-center justify-center py-8"><Loader className="size-5 animate-spin text-muted-foreground" /></div>
            ) : health.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t("publishing.admin.noHealthData", "No platform health data")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {health.map((platform: any) => (
                  <div key={platform.id || platform.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40">
                        <Share2 className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{platform.name || platform.platform}</p>
                        <p className="text-xs text-muted-foreground">{platform.lastCheck || "—"}</p>
                      </div>
                    </div>
                    <Badge tone={STATUS_COLORS[platform.status] as any || "muted"}>
                      {platform.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          <DashboardCard title={t("publishing.admin.recentLogs", "Recent Publishing Logs")}>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader className="size-5 animate-spin text-muted-foreground" /></div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t("publishing.admin.noLogs", "No publishing logs")}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {logs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {log.status === "published" ? (
                        <CheckCircle className="size-4 text-green-500 shrink-0" />
                      ) : log.status === "failed" ? (
                        <XCircle className="size-4 text-red-500 shrink-0" />
                      ) : (
                        <Clock className="size-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm truncate">{log.title || log.caption || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.platforms?.join(", ") || "—"} &bull; {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                    <Badge tone={STATUS_COLORS[log.status] as any || "muted"}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <DashboardCard title={t("publishing.admin.publishingQueue", "Publishing Queue")}>
          <div className="flex items-center gap-2 pb-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search", "Search") + "..."}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("admin.status", "All Status")}</option>
              <option value="published">{t("publishing.status.published", "Published")}</option>
              <option value="scheduled">{t("publishing.status.scheduled", "Scheduled")}</option>
              <option value="publishing">{t("publishing.status.publishing", "Publishing")}</option>
              <option value="failed">{t("publishing.status.failed", "Failed")}</option>
            </select>
          </div>

          {queueLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Send className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("publishing.admin.noQueueItems", "No items in the publishing queue")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.description", "Content")}</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("publishing.platforms", "Platforms")}</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("publishing.admin.user", "User")}</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date", "Date")}</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((item: any) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                      <td className="py-3 px-2 max-w-[300px] truncate">{item.caption || item.title || "—"}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 flex-wrap">
                          {(item.platforms || []).map((p: string) => (
                            <Badge key={p} tone="info">{p}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">{item.userId || item.user || "—"}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <Badge tone={STATUS_COLORS[item.status] as any || "muted"}>{item.status}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {item.status === "failed" && (
                            <Button variant="ghost" size="icon" className="size-8">
                              <RefreshCw className="size-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>
      </DashboardCard>
    </div>
  );
}
