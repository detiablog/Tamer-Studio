"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Play, Pause, RotateCcw, Trash2, Loader } from "lucide-react";
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
      console.error(`[Fetcher] Failed to fetch ${url}:`, error);
      throw error;
    });

export default function QueuesPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");

  const { data, error, isLoading, mutate } = useSWR("/api/admin/queues", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const queues = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => queues.filter((q: any) => q.name?.toLowerCase().includes(search.toLowerCase())),
    [queues, search]
  );

  const handleQueueAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/queues/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} queue`);
      toast.success(t(`admin.queue${action.charAt(0).toUpperCase() + action.slice(1)}`, `Queue ${action}`));
      mutate();
    } catch {
      toast.error(t(`admin.queue${action.charAt(0).toUpperCase() + action.slice(1)}Failed`, `Failed to ${action} queue`));
    }
  };

  const handleRetryFailed = (id: string) => handleQueueAction(id, "retryFailed");
  const handleClear = (id: string) => {
    if (!confirm(t("admin.confirmClearQueue", "Clear this queue?"))) return;
    handleQueueAction(id, "clear");
  };
  const handleToggleStatus = (id: string) => handleQueueAction(id, "toggle");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.queues", "Queues") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.queues", "Queues")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.queuesDescription", "Monitor job queues and workers")}</p>
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
        <Breadcrumbs items={[{ label: t("admin.queues", "Queues") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.queues", "Queues")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.queuesDescription", "Monitor job queues and workers")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.queues", "Queues") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.queues", "Queues")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.queuesDescription", "Monitor job queues and workers")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.queuesSearch", "Search queues...")} className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.noQueues", "No queues found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(q) => q.id}
            columns={[
              { key: "name", header: t("admin.queue", "Queue"), render: (q: any) => <p className="font-medium text-sm">{q.name}</p> },
              { key: "status", header: t("common.status", "Status"), render: (q: any) => <Badge tone={q.status === "Active" ? "success" : "muted"}>{q.status}</Badge> },
              { key: "jobsTotal", header: t("admin.total", "Total"), render: (q: any) => <span className="text-sm">{q.jobsTotal}</span> },
              { key: "jobsActive", header: t("admin.active", "Active"), render: (q: any) => <Badge tone="info">{q.jobsActive}</Badge> },
              { key: "jobsCompleted", header: t("admin.completed", "Completed"), render: (q: any) => <span className="text-sm">{q.jobsCompleted}</span> },
              { key: "jobsFailed", header: t("admin.failed", "Failed"), render: (q: any) => <Badge tone={q.jobsFailed > 0 ? "warning" : "success"}>{q.jobsFailed}</Badge> },
              { key: "ratePerSec", header: t("admin.ratePerSec", "Rate/s"), render: (q: any) => <span className="text-sm">{q.ratePerSec}</span> },
              { key: "actions", header: "", align: "right", render: (q: any) => (
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleToggleStatus(q.id)} aria-label={t("admin.toggleQueueStatus", "Toggle queue status")}>
                    {q.status === "Active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  </Button>
                  {q.jobsFailed > 0 && <Button variant="ghost" size="icon-xs" onClick={() => handleRetryFailed(q.id)} aria-label={t("admin.retryFailed", "Retry failed")} className="text-amber-600 hover:text-amber-700"><RotateCcw className="size-3.5" /></Button>}
                  <Button variant="ghost" size="icon-xs" onClick={() => handleClear(q.id)} aria-label={t("admin.clearQueue", "Clear queue")} className="text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button>
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}
