"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, Play, Pause, XCircle, RotateCcw, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_QUEUES = [
  { id: "q_1", name: "default", jobsTotal: 142, jobsActive: 8, jobsCompleted: 130, jobsFailed: 4, ratePerSec: 12.5, status: "Active" },
  { id: "q_2", name: "audio", jobsTotal: 56, jobsActive: 3, jobsCompleted: 51, jobsFailed: 2, ratePerSec: 8.2, status: "Active" },
  { id: "q_3", name: "processing", jobsTotal: 23, jobsActive: 0, jobsCompleted: 20, jobsFailed: 3, ratePerSec: 0, status: "Paused" },
  { id: "q_4", name: "notifications", jobsTotal: 890, jobsActive: 45, jobsCompleted: 830, jobsFailed: 15, ratePerSec: 25.1, status: "Active" },
];

export default function QueuesPage() {
  const [queues, setQueues] = React.useState(MOCK_QUEUES);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const filtered = queues.filter((q) => q.name.toLowerCase().includes(search.toLowerCase()));

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setQueues(MOCK_QUEUES); setLoading(false); toast.success("Queues refreshed"); }, 600);
  };

  const handleRetryFailed = (id: string) => {
    setQueues((prev) => prev.map((q) => q.id === id ? { ...q, jobsFailed: 0 } : q));
    toast.success("Retrying failed jobs");
  };

  const handleClear = (id: string) => {
    if (!confirm("Clear this queue?")) return;
    setQueues((prev) => prev.map((q) => q.id === id ? { ...q, jobsTotal: 0, jobsActive: 0, jobsCompleted: 0, jobsFailed: 0 } : q));
    toast.success("Queue cleared");
  };

  const handleToggleStatus = (id: string) => {
    setQueues((prev) => prev.map((q) => q.id === id ? { ...q, status: q.status === "Active" ? "Paused" : "Active" } : q));
    toast.success("Queue status updated");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Queues" }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Queues</h1>
            <p className="text-muted-foreground text-sm mt-1">Monitor job queues and workers</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search queues..." className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(q) => q.id}
          columns={[
            { key: "name", header: "Queue", render: (q: any) => <p className="font-medium text-sm">{q.name}</p> },
            { key: "status", header: "Status", render: (q: any) => <Badge tone={q.status === "Active" ? "success" : "muted"}>{q.status}</Badge> },
            { key: "jobsTotal", header: "Total", render: (q: any) => <span className="text-sm">{q.jobsTotal}</span> },
            { key: "jobsActive", header: "Active", render: (q: any) => <Badge tone="info">{q.jobsActive}</Badge> },
            { key: "jobsCompleted", header: "Completed", render: (q: any) => <span className="text-sm">{q.jobsCompleted}</span> },
            { key: "jobsFailed", header: "Failed", render: (q: any) => <Badge tone={q.jobsFailed > 0 ? "warning" : "success"}>{q.jobsFailed}</Badge> },
            { key: "ratePerSec", header: "Rate/s", render: (q: any) => <span className="text-sm">{q.ratePerSec}</span> },
            { key: "actions", header: "", align: "right", render: (q: any) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon-xs" onClick={() => handleToggleStatus(q.id)} aria-label="Toggle queue status">
                  {q.status === "Active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                </Button>
                {q.jobsFailed > 0 && <Button variant="ghost" size="icon-xs" onClick={() => handleRetryFailed(q.id)} aria-label="Retry failed" className="text-amber-600 hover:text-amber-700"><RotateCcw className="size-3.5" /></Button>}
                <Button variant="ghost" size="icon-xs" onClick={() => handleClear(q.id)} aria-label="Clear queue" className="text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button>
              </div>
            )},
          ]}
        />
      </DashboardCard>
    </div>
  );
}