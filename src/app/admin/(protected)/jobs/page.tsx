"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Loader, X, RefreshCw, Play, Pause, XCircle, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_JOBS = [
  { id: "job_1", name: "Hero Video Render", status: "Running", progress: 72, owner: "Alice Johnson", createdAt: "23/07/2026", queue: "default" },
  { id: "job_2", name: "Product Image Batch", status: "Queued", progress: 0, owner: "Bob Smith", createdAt: "23/07/2026", queue: "default" },
  { id: "job_3", name: "Voiceover Generation", status: "Running", progress: 45, owner: "Carol White", createdAt: "22/07/2026", queue: "audio" },
  { id: "job_4", name: "Thumbnail Extraction", status: "Completed", progress: 100, owner: "Alice Johnson", createdAt: "22/07/2026", queue: "default" },
  { id: "job_5", name: "Watermark Apply", status: "Failed", progress: 30, owner: "Bob Smith", createdAt: "21/07/2026", queue: "default" },
  { id: "job_6", name: "Subtitle Sync", status: "Queued", progress: 0, owner: "Carol White", createdAt: "21/07/2026", queue: "audio" },
  { id: "job_7", name: "4K Upscale", status: "Running", progress: 88, owner: "Alice Johnson", createdAt: "20/07/2026", queue: "processing" },
  { id: "job_8", name: "Metadata Extract", status: "Completed", progress: 100, owner: "Bob Smith", createdAt: "20/07/2026", queue: "default" },
];

export default function JobsPage() {
  const [jobs, setJobs] = React.useState(MOCK_JOBS);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(false);

  const filtered = jobs.filter((j) => {
    const matchesSearch = j.name.toLowerCase().includes(search.toLowerCase()) || j.owner.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleRetry = (id: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "Queued", progress: 0 } : j)));
    toast.success("Job queued for retry");
  };

  const handleCancel = (id: string) => {
    if (!confirm("Cancel this job?")) return;
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "Cancelled", progress: 0 } : j)));
    toast.success("Job cancelled");
  };

  const handlePause = (id: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "Paused", progress: j.progress } : j)));
    toast.success("Job paused");
  };

  const handleResume = (id: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "Running", progress: j.progress } : j)));
    toast.success("Job resumed");
  };

  const handleViewLogs = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    const mockLogs = [
      { time: "14:30:01", level: "INFO", message: `Job ${job?.name} started` },
      { time: "14:30:05", level: "INFO", message: "Processing step 1/4" },
      { time: "14:30:12", level: "INFO", message: "Processing step 2/4" },
      { time: "14:30:20", level: "WARN", message: "High memory usage detected" },
      { time: "14:30:28", level: "INFO", message: "Processing step 3/4" },
      { time: "14:30:35", level: "INFO", message: "Processing step 4/4" },
    ];
    const logText = mockLogs.map((l) => `[${l.time}] ${l.level}: ${l.message}`).join("\n");
    alert(`Logs for "${job?.name}":\n\n${logText}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setJobs(MOCK_JOBS);
      setLoading(false);
      toast.success("Dashboard refreshed");
    }, 800);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Jobs" }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jobs</h1>
            <p className="text-muted-foreground text-sm mt-1">Monitor and manage background jobs</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="pl-9" />
          </div>
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="mr-2 size-4" />
              Filter
            </Button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="queued">Queued</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(j) => j.id}
            columns={[
              { key: "name", header: "Job", render: (j: any) => <p className="font-medium text-sm">{j.name}</p> },
              { key: "status", header: "Status", render: (j: any) => <Badge tone={j.status === "Running" ? "info" : j.status === "Completed" ? "success" : j.status === "Failed" ? "warning" : j.status === "Paused" ? "muted" : "default"}>{j.status}</Badge> },
              { key: "progress", header: "Progress", render: (j: any) => <div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted/40"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${j.progress}%` }} /></div><span className="text-xs text-muted-foreground">{j.progress}%</span></div> },
              { key: "owner", header: "Owner", render: (j: any) => <span className="text-sm">{j.owner}</span> },
              { key: "queue", header: "Queue", render: (j: any) => <span className="text-xs text-muted-foreground">{j.queue}</span> },
              { key: "createdAt", header: "Created", render: (j: any) => <span className="text-sm">{j.createdAt}</span> },
              { key: "actions", header: "", align: "right", render: (j: any) => (
                <div className="flex items-center gap-1 justify-end">
                  {j.status === "Running" && <Button variant="ghost" size="icon-xs" onClick={() => handlePause(j.id)} aria-label="Pause job"><Pause className="size-3.5" /></Button>}
                  {j.status === "Paused" && <Button variant="ghost" size="icon-xs" onClick={() => handleResume(j.id)} aria-label="Resume job"><Play className="size-3.5" /></Button>}
                  {(j.status === "Failed" || j.status === "Queued") && <Button variant="ghost" size="icon-xs" onClick={() => handleRetry(j.id)} aria-label="Retry job"><RotateCcw className="size-3.5" /></Button>}
                  {j.status === "Running" && <Button variant="ghost" size="icon-xs" onClick={() => handleCancel(j.id)} aria-label="Cancel job" className="text-destructive hover:text-destructive"><XCircle className="size-3.5" /></Button>}
                  <Button variant="ghost" size="icon-xs" onClick={() => handleViewLogs(j.id)} aria-label="View logs"><Eye className="size-3.5" /></Button>
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}