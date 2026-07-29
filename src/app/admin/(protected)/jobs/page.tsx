"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader, RefreshCw, Play, Pause, XCircle, RotateCcw, Eye } from "lucide-react";
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

export default function JobsPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const { data, error, isLoading, mutate } = useSWR("/api/admin/jobs", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const jobs = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const filtered = React.useMemo(() => {
    return jobs.filter((j: any) => {
      const matchesSearch = (j.name || "").toLowerCase().includes(search.toLowerCase()) || (j.owner || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || (j.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleJobAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} job`);
      toast.success(t(`admin.job${action.charAt(0).toUpperCase() + action.slice(1)}`, `Job ${action}`));
      mutate();
    } catch {
      toast.error(t(`admin.job${action.charAt(0).toUpperCase() + action.slice(1)}Failed`, `Failed to ${action} job`));
    }
  };

  const handleRetry = (id: string) => handleJobAction(id, "retry");
  const handleCancel = (id: string) => {
    if (!confirm(t("admin.confirmCancelJob", "Cancel this job?"))) return;
    handleJobAction(id, "cancel");
  };
  const handlePause = (id: string) => handleJobAction(id, "pause");
  const handleResume = (id: string) => handleJobAction(id, "resume");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.jobs", "Jobs") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.jobs", "Jobs")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.jobsDescription", "Monitor and manage background jobs")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("admin.loadingJobs", "Loading jobs...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.jobs", "Jobs") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.jobs", "Jobs")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.jobsDescription", "Monitor and manage background jobs")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.jobs", "Jobs") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.jobs", "Jobs")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.jobsDescription", "Monitor and manage background jobs")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.jobsSearch", "Search jobs...")} className="pl-9" />
          </div>
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="mr-2 size-4" />
              {t("admin.filter", "Filter")}
            </Button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="all">{t("admin.allStatus", "All Status")}</option>
                  <option value="running">{t("admin.statusRunning", "Running")}</option>
                  <option value="queued">{t("admin.statusQueued", "Queued")}</option>
                  <option value="completed">{t("admin.statusCompleted", "Completed")}</option>
                  <option value="failed">{t("admin.statusFailed", "Failed")}</option>
                  <option value="paused">{t("admin.statusPaused", "Paused")}</option>
                  <option value="cancelled">{t("admin.statusCancelled", "Cancelled")}</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.noJobs", "No jobs found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(j) => j.id}
            columns={[
              { key: "name", header: t("admin.job", "Job"), render: (j: any) => <p className="font-medium text-sm">{j.name}</p> },
              { key: "status", header: t("admin.status", "Status"), render: (j: any) => <Badge tone={j.status === "Running" ? "info" : j.status === "Completed" ? "success" : j.status === "Failed" ? "warning" : j.status === "Paused" ? "muted" : "default"}>{j.status}</Badge> },
              { key: "progress", header: t("admin.progress", "Progress"), render: (j: any) => <div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/40"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${j.progress || 0}%` }} /></div><span className="text-xs text-muted-foreground">{j.progress || 0}%</span></div> },
              { key: "owner", header: t("admin.owner", "Owner"), render: (j: any) => <span className="text-sm">{j.owner}</span> },
              { key: "queue", header: t("admin.queue", "Queue"), render: (j: any) => <span className="text-xs text-muted-foreground">{j.queue}</span> },
              { key: "createdAt", header: t("admin.created", "Created"), render: (j: any) => <span className="text-sm">{j.createdAt}</span> },
              { key: "actions", header: "", align: "right", render: (j: any) => (
                <div className="flex items-center gap-1 justify-end">
                  {j.status === "Running" && <Button variant="ghost" size="icon-xs" onClick={() => handlePause(j.id)} aria-label={t("admin.pauseJob", "Pause job")}><Pause className="size-3.5" /></Button>}
                  {j.status === "Paused" && <Button variant="ghost" size="icon-xs" onClick={() => handleResume(j.id)} aria-label={t("admin.resumeJob", "Resume job")}><Play className="size-3.5" /></Button>}
                  {(j.status === "Failed" || j.status === "Queued") && <Button variant="ghost" size="icon-xs" onClick={() => handleRetry(j.id)} aria-label={t("admin.retryJob", "Retry job")}><RotateCcw className="size-3.5" /></Button>}
                  {j.status === "Running" && <Button variant="ghost" size="icon-xs" onClick={() => handleCancel(j.id)} aria-label={t("admin.cancelJob", "Cancel job")} className="text-destructive hover:text-destructive"><XCircle className="size-3.5" /></Button>}
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}
