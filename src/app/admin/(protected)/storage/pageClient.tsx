"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader,
  HardDrive,
  ImageIcon,
  Film,
  FileText,
  Trash2,
  RefreshCw,
  Settings,
  Activity,
  AlertTriangle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const KIND_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="size-4" />,
  video: <Film className="size-4" />,
  document: <FileText className="size-4" />,
};

export function AdminStoragePageClient() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState<"overview" | "users" | "cleanup" | "config">("overview");
  const [quotaEditId, setQuotaEditId] = React.useState<string | null>(null);
  const [quotaValue, setQuotaValue] = React.useState("");

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/admin/storage/stats", fetcher);
  const { data: usersData, isLoading: usersLoading, mutate: mutateUsers } = useSWR("/api/admin/storage/users", fetcher);
  const { data: healthData, mutate: mutateHealth } = useSWR("/api/admin/storage/health", fetcher);
  const { data: cleanupData, mutate: mutateCleanup } = useSWR("/api/admin/storage/cleanup", fetcher);
  const { data: configData, mutate: mutateConfig } = useSWR("/api/admin/storage/config", fetcher);

  const stats = statsData?.data;
  const users = usersData?.data ?? [];
  const health = healthData?.data;
  const cleanup = cleanupData?.data;
  const config = configData?.data;

  const handleSetQuota = async (userId: string) => {
    const bytes = parseInt(quotaValue, 10);
    if (isNaN(bytes) || bytes <= 0) return;
    try {
      const res = await fetch(`/api/admin/storage/users/${userId}/quota`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotaBytes: bytes }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        setQuotaEditId(null);
        setQuotaValue("");
        mutateUsers();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRunCleanup = async () => {
    try {
      const res = await fetch("/api/admin/storage/cleanup/run", { method: "POST" });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutateCleanup();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/admin/storage/files/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u: any) => u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.storage", "Storage") }]} />

      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.storageManagement", "Storage Management")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.storageManagementDesc", "Monitor and manage storage across all users")}</p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-border">
          {(["overview", "users", "cleanup", "config"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${
                tab === key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key === "overview" ? t("admin.overview", "Overview") : key === "users" ? t("admin.users", "Users") : key === "cleanup" ? t("admin.cleanup", "Cleanup") : t("admin.config", "Config")}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <HardDrive className="size-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("admin.totalStorageUsed", "Total Storage Used")}</p>
                </div>
                <p className="text-2xl font-bold">{formatSize(stats?.totalUsed ?? 0)}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="size-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("admin.totalUsers", "Total Users")}</p>
                </div>
                <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <ImageIcon className="size-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("admin.totalFiles", "Total Files")}</p>
                </div>
                <p className="text-2xl font-bold">{stats?.totalFiles ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="size-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("admin.storageProvider", "Provider")}</p>
                </div>
                <p className="text-2xl font-bold">{config?.provider ?? "S3"}</p>
              </div>
            </div>

            {health && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium mb-3">{t("admin.providerHealth", "Provider Health")}</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${health.status === "healthy" ? "bg-green-500" : health.status === "degraded" ? "bg-yellow-500" : "bg-red-500"}`} />
                    <span className="text-sm">{health.status === "healthy" ? t("admin.healthy", "Healthy") : health.status === "degraded" ? t("admin.degraded", "Degraded") : t("admin.offline", "Offline")}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("admin.latency", "Latency")}</p>
                    <p className="text-sm font-medium">{health.latency ?? "—"}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("admin.lastChecked", "Last Checked")}</p>
                    <p className="text-sm font-medium">{health.lastChecked ? new Date(health.lastChecked).toLocaleString() : "—"}</p>
                  </div>
                </div>
              </div>
            )}

            {stats?.byKind && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium mb-3">{t("admin.storageBreakdown", "Storage Breakdown")}</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(stats.byKind).map(([kind, data]: [string, any]) => (
                    <div key={kind} className="flex items-center gap-3">
                      {KIND_ICONS[kind] ?? <FileText className="size-4" />}
                      <div>
                        <p className="text-sm font-medium capitalize">{kind}</p>
                        <p className="text-xs text-muted-foreground">{data.count} files · {formatSize(data.totalSize)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.searchUsers", "Search users...")}
                className="pl-9"
              />
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AdminDataTable
                data={filteredUsers}
                keyExtractor={(item: any) => item.userId}
                columns={[
                  {
                    key: "user",
                    header: t("admin.user", "User"),
                    render: (item: any) => (
                      <div>
                        <p className="text-sm font-medium">{item.name ?? item.email}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    ),
                  },
                  {
                    key: "storageUsed",
                    header: t("admin.storageUsed", "Storage Used"),
                    render: (item: any) => <span className="text-sm">{formatSize(item.storageUsed ?? 0)}</span>,
                  },
                  {
                    key: "quotaBytes",
                    header: t("admin.quota", "Quota"),
                    render: (item: any) => {
                      if (quotaEditId === item.userId) {
                        return (
                          <div className="flex items-center gap-1">
                            <Input
                              value={quotaValue}
                              onChange={(e) => setQuotaValue(e.target.value)}
                              placeholder="bytes"
                              className="w-32 h-8 text-xs"
                            />
                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleSetQuota(item.userId)}>
                              {t("common.save", "Save")}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setQuotaEditId(null)}>
                              {t("common.cancel", "Cancel")}
                            </Button>
                          </div>
                        );
                      }
                      return (
                        <button
                          className="text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => { setQuotaEditId(item.userId); setQuotaValue(String(item.quotaBytes ?? "")); }}
                        >
                          {item.quotaBytes ? formatSize(item.quotaBytes) : t("admin.setQuota", "Set Quota")}
                        </button>
                      );
                    },
                  },
                  {
                    key: "fileCount",
                    header: t("admin.fileCount", "Files"),
                    render: (item: any) => <span className="text-sm">{item.fileCount ?? 0}</span>,
                  },
                  {
                    key: "status",
                    header: t("common.status", "Status"),
                    render: (item: any) => {
                      const pct = item.quotaBytes ? ((item.storageUsed ?? 0) / item.quotaBytes) * 100 : 0;
                      return (
                        <Badge tone={pct > 90 ? "danger" : pct > 70 ? "warning" : "success"}>
                          {pct > 0 ? `${pct.toFixed(0)}%` : "—"}
                        </Badge>
                      );
                    },
                  },
                ]}
              />
            )}
          </div>
        )}

        {tab === "cleanup" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("admin.cleanupDesc", "Run cleanup jobs to remove expired files and free up storage")}</p>
              <Button size="sm" onClick={handleRunCleanup}>
                <RefreshCw className="mr-1.5 size-3.5" />
                {t("admin.runCleanup", "Run Cleanup")}
              </Button>
            </div>

            {cleanup && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("admin.expiredFiles", "Expired Files")}</p>
                  <p className="text-2xl font-bold">{cleanup.expiredCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(cleanup.expiredSize ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("admin.orphanedFiles", "Orphaned Files")}</p>
                  <p className="text-2xl font-bold">{cleanup.orphanedCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(cleanup.orphanedSize ?? 0)}</p>
                </div>
              </div>
            )}

            {cleanup?.recentRuns && cleanup.recentRuns.length > 0 && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium mb-3">{t("admin.recentCleanupRuns", "Recent Cleanup Runs")}</h3>
                <div className="space-y-2">
                  {cleanup.recentRuns.map((run: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{run.filesDeleted ?? 0} files deleted</span>
                      <span className="text-muted-foreground">{run.runAt ? new Date(run.runAt).toLocaleString() : "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "config" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="font-medium mb-3">{t("admin.storageProviderConfig", "Storage Provider Configuration")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.provider", "Provider")}</p>
                  <p className="text-sm font-medium">{config?.provider ?? "S3"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.region", "Region")}</p>
                  <p className="text-sm font-medium">{config?.region ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.bucket", "Bucket")}</p>
                  <p className="text-sm font-medium">{config?.bucket ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("admin.defaultQuota", "Default User Quota")}</p>
                  <p className="text-sm font-medium">{config?.defaultQuotaBytes ? formatSize(config.defaultQuotaBytes) : "—"}</p>
                </div>
              </div>
            </div>

            {config?.analytics && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium mb-3">{t("admin.storageAnalytics", "Storage Analytics")}</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("admin.bandwidth", "Bandwidth (30d)")}</p>
                    <p className="text-sm font-medium">{config.analytics.bandwidth30d ? formatSize(config.analytics.bandwidth30d) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("admin.totalRequests", "Requests (30d)")}</p>
                    <p className="text-sm font-medium">{config.analytics.requests30d ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("admin.growthTrend", "Growth Trend")}</p>
                    <p className="text-sm font-medium">{config.analytics.growthTrend ?? "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
