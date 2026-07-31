"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Eye, Loader } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

export default function AuditLogsPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");

  const { data, error, isLoading, mutate } = useSWR("/api/admin/audit-logs", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const logs = React.useMemo(() => {
    if (data?.success && data.data?.entries) return data.data.entries;
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => logs.filter((l: any) =>
      (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.user || l.actor || "").toLowerCase().includes(search.toLowerCase())
    ),
    [logs, search]
  );

  const formatAuditAction = (action: string, user?: string) => {
    if (!action) return "\u2014";
    const key = action.replace(/\./g, "");
    const translated = t(`admin.auditLogs.${key}`, action);
    if (action === "user.login" && user) {
      return `${user} - ${translated}`;
    }
    return translated;
  };

  const handleExport = () => {
    const headers = "Action,User,Target,Timestamp,IP,Status\n";
    const rows = logs.map((l: any) => `${l.action || ""},${l.user || l.actor || ""},${l.target || ""},${l.timestamp || ""},${l.ip || ""},${l.status || ""}`).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.auditLogs.exportSuccess", "Audit logs exported"));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.auditLogs", "Audit Logs") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.auditLogs", "Audit Logs")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.auditLogs.description", "View system audit and activity logs")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.auditLogs", "Audit Logs") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.auditLogs", "Audit Logs")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.auditLogs.description", "View system audit and activity logs")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
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
      <Breadcrumbs items={[{ label: t("admin.auditLogs", "Audit Logs") }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.auditLogs", "Audit Logs")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.auditLogs.description", "View system audit and activity logs")}</p>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.auditLogs.searchLogs", "Search logs...")} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}><RefreshCw className="mr-2 size-4" />{t("common.export", "Export")}</Button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.auditLogs.noLogs", "No audit logs found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(l) => l.id}
            columns={[
              { key: "action", header: t("admin.auditLogs.action", "Action"), render: (l: any) => <span className="font-medium text-sm">{formatAuditAction(l.action, l.user || l.actor)}</span> },
              { key: "user", header: t("admin.auditLogs.user", "User"), render: (l: any) => <span className="text-sm">{l.user || l.actor}</span> },
              { key: "target", header: t("admin.auditLogs.target", "Target"), render: (l: any) => <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{l.target}</code> },
              { key: "timestamp", header: t("admin.auditLogs.timestamp", "Timestamp"), render: (l: any) => <span className="text-xs text-muted-foreground">{l.timestamp || l.createdAt}</span> },
              { key: "ip", header: t("admin.auditLogs.ipAddress", "IP Address"), render: (l: any) => <span className="text-xs font-mono">{l.ip}</span> },
              { key: "status", header: t("common.status", "Status"), render: (l: any) => <Badge tone={l.status === "Success" || l.status === "success" ? "success" : "warning"}>{l.status}</Badge> },
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}
