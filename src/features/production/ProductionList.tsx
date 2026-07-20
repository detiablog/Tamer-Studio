"use client";

import * as React from "react";
import Link from "next/link";
import { productionStore, type ProductionJob, type ProductionStatus, type WorkflowType } from "./production.store";
import { ProductionCard } from "@/components/production/ProductionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export function ProductionList() {
  const [jobs, setJobs] = React.useState<ProductionJob[]>(() => productionStore.getAll());
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProductionStatus | "All">("All");
  const [typeFilter, setTypeFilter] = React.useState<WorkflowType | "All">("All");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  React.useEffect(() => {
    setJobs(productionStore.getAll());
  }, []);

  const statusOptions: (ProductionStatus | "All")[] = ["All", "Draft", "Queued", "Preparing", "Running", "Waiting", "Completed", "Failed", "Cancelled"];
  const workflowOptions: (WorkflowType | "All")[] = [
    "All",
    "Image Generation",
    "Video Generation",
    "Audio Generation",
    "Script Generation",
    "Media Processing",
    "Rendering",
    "Publishing Preparation",
    "Custom Workflow",
  ];

  const filtered = jobs.filter((job) => {
    if (statusFilter !== "All" && job.status !== statusFilter) return false;
    if (typeFilter !== "All" && job.workflowType !== typeFilter) return false;
    if (query) {
      const lower = query.toLowerCase();
      return [job.name, job.workflowName, job.project, job.workspace, job.owner, job.mediaAsset]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(lower));
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const summary = {
    total: jobs.length,
    running: jobs.filter((job) => job.status === "Running").length,
    queued: jobs.filter((job) => job.status === "Queued").length,
    completed: jobs.filter((job) => job.status === "Completed").length,
    failed: jobs.filter((job) => job.status === "Failed").length,
    highPriority: jobs.filter((job) => job.priority === "High" || job.priority === "Critical").length,
  };

  const refresh = () => setJobs(productionStore.getAll());

  const handleRetry = (id: string) => {
    productionStore.retry(id);
    refresh();
    toast.success("Job retry queued");
  };

  const handleCancel = (id: string) => {
    productionStore.cancel(id);
    refresh();
    toast.success("Job cancelled");
  };

  const handleDuplicate = (id: string) => {
    productionStore.duplicate(id);
    refresh();
    toast.success("Job duplicated");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">Total jobs</div>
              <div className="mt-3 text-3xl font-semibold">{summary.total}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">Running</div>
              <div className="mt-3 text-3xl font-semibold">{summary.running}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">Queued</div>
              <div className="mt-3 text-3xl font-semibold">{summary.queued}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="mt-3 text-3xl font-semibold">{summary.completed}</div>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">Failed</div>
              <div className="mt-3 text-3xl font-semibold">{summary.failed}</div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Queue overview</div>
                <div className="mt-3 text-2xl font-semibold">{filtered.length}</div>
              </div>
              <Button variant="secondary" onClick={refresh}>Refresh</Button>
            </div>
            <div className="mt-5 space-y-3">
              {["Running", "Queued", "Waiting", "Failed", "Completed"].map((status) => {
                const count = jobs.filter((job) => job.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>{status}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">Workflow health</div>
            <div className="mt-3 text-sm text-foreground">No critical issues detected. Production workflows are operating normally.</div>
          </div>
        </aside>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-base font-semibold">Production queue</p>
            <p className="text-sm text-muted-foreground">Filter and manage active workflows across your workspaces.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input placeholder="Search jobs, projects, or owners" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="min-w-[240px]" />
            <select className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as ProductionStatus | "All"); setPage(1); }}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as WorkflowType | "All"); setPage(1); }}>
              {workflowOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Button variant="ghost" onClick={() => setView((v) => (v === "grid" ? "table" : "grid"))}>{view === "grid" ? "Table" : "Grid"}</Button>
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">No production jobs match your filters.</div>
        ) : view === "grid" ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {paged.map((job) => (
              <ProductionCard key={job.id} job={job} onRetry={handleRetry} onCancel={handleCancel} onDuplicate={handleDuplicate} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((job) => (
                  <tr key={job.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <Link href={{ pathname: "/production/[id]", query: { id: job.id } }} className="font-medium text-foreground hover:underline">{job.name}</Link>
                      <div className="text-xs text-muted-foreground">{job.project} • {job.workspace}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{job.workflowType}</td>
                    <td className="px-4 py-4"><Badge tone={job.status === "Completed" ? "success" : job.status === "Running" ? "info" : job.status === "Failed" ? "warning" : "muted"}>{job.status}</Badge></td>
                    <td className="px-4 py-4">
                      <div className="rounded-full bg-muted/40 h-2 overflow-hidden">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${job.progress}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-4">{job.owner}</td>
                    <td className="px-4 py-4 flex flex-wrap gap-2">
                      {job.status === "Failed" ? <Button size="sm" onClick={() => handleRetry(job.id)}>Retry</Button> : null}
                      {(job.status !== "Completed" && job.status !== "Cancelled") ? <Button size="sm" variant="destructive" onClick={() => handleCancel(job.id)}>Cancel</Button> : null}
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicate(job.id)}>Duplicate</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">Page {page} / {pages}</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="ghost" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
