"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Activity, CheckCircle, XCircle, Zap, Loader } from "lucide-react";
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

export default function AIProvidersPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/ai-providers", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const providers = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => providers.filter((p: any) => (p.name || "").toLowerCase().includes(search.toLowerCase())),
    [providers, search]
  );

  const handleConnect = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ai-providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to connect provider");
      toast.success(t("admin.providerConnected", "Provider connected"));
      mutate();
    } catch {
      toast.error(t("admin.providerConnectFailed", "Failed to connect provider"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm(t("admin.confirmDisconnectProvider", "Disconnect this provider?"))) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ai-providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inactive" }),
      });
      if (!res.ok) throw new Error("Failed to disconnect provider");
      toast.success(t("admin.providerDisconnected", "Provider disconnected"));
      mutate();
    } catch {
      toast.error(t("admin.providerDisconnectFailed", "Failed to disconnect provider"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleTest = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ai-providers/${id}/test`, { method: "POST" });
      const result = await res.json();
      if (!res.ok) throw new Error("Test failed");
      toast.success(t("admin.connectionHealthy", "Connection healthy"));
      mutate();
    } catch {
      toast.error(t("admin.connectionTestFailed", "Connection test failed"));
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.aiProviders", "AI Providers") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.aiProviders", "AI Providers")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiProvidersDescription", "Manage AI provider integrations")}</p>
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
        <Breadcrumbs items={[{ label: t("admin.aiProviders", "AI Providers") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.aiProviders", "AI Providers")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiProvidersDescription", "Manage AI provider integrations")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.aiProviders", "AI Providers") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.aiProviders", "AI Providers")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiProvidersDescription", "Manage AI provider integrations")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()}><RefreshCw className="mr-2 size-4" />{t("common.refresh", "Refresh")}</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.searchProviders", "Search providers...")} className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.noProviders", "No AI providers found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(p) => p.id}
            columns={[
              { key: "name", header: t("admin.provider", "Provider"), render: (p: any) => <div className="flex items-center gap-2"><Zap className="size-4 text-primary" /><span className="font-medium text-sm">{p.name}</span></div> },
              { key: "model", header: t("admin.model", "Model"), render: (p: any) => <span className="text-sm">{p.model}</span> },
              { key: "status", header: t("admin.status", "Status"), render: (p: any) => <Badge tone={p.status === "Connected" ? "success" : "muted"}>{p.status}</Badge> },
              { key: "latency", header: t("admin.latency", "Latency"), render: (p: any) => <span className="text-sm">{p.latency}</span> },
              { key: "usage", header: t("admin.usage", "Usage"), render: (p: any) => <span className="text-sm">{p.usage}</span> },
              { key: "lastChecked", header: t("admin.lastChecked", "Last Checked"), render: (p: any) => <span className="text-xs text-muted-foreground">{p.lastChecked}</span> },
              { key: "actions", header: "", align: "right", render: (p: any) => (
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleTest(p.id)} disabled={actionLoading === p.id} aria-label={t("admin.testConnection", "Test connection")}><Activity className="size-3.5" /></Button>
                  {p.status === "Connected"
                    ? <Button variant="ghost" size="icon-xs" onClick={() => handleDisconnect(p.id)} disabled={actionLoading === p.id} aria-label={t("admin.disconnect", "Disconnect")} className="text-destructive hover:text-destructive"><XCircle className="size-3.5" /></Button>
                    : <Button variant="ghost" size="icon-xs" onClick={() => handleConnect(p.id)} disabled={actionLoading === p.id} aria-label={t("admin.connect", "Connect")}><CheckCircle className="size-3.5 text-green-600" /></Button>
                  }
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}
