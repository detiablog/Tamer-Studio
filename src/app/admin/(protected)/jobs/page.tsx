"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Pause, RotateCcw, Play, MoreVertical } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminJobsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/jobs", fetcher);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const jobs = data?.jobs ?? [];
  const filtered = statusFilter === "all" ? jobs : jobs.filter((j: any) => j.status.toLowerCase() === statusFilter);

  const stats = {
    total: jobs.length,
    running: jobs.filter((j: any) => j.status === "processing").length,
    completed: jobs.filter((j: any) => j.status === "completed").length,
    failed: jobs.filter((j: any) => j.status === "failed").length,
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive">Failed to load jobs</div>;
  }

  return (
    <RoleGuard allowedRoles={["workspace_admin", "organization_admin", "system_admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Jobs" value={stats.total} />
          <StatCard title="Running" value={stats.running} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Failed" value={stats.failed} />
        </div>

        <DashboardCard title="Production Jobs" description="Monitor and manage jobs across all workspaces">
          <div className="flex items-center gap-2 pb-4">
            {["all", "processing", "queued", "completed", "failed"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          <AdminDataTable
            data={filtered}
            keyExtractor={(j) => j.id}
            columns={[
              { key: "name", header: "Job", render: (j: any) => (
                <div>
                  <p className="font-medium">{j.type}</p>
                  <p className="text-xs text-muted-foreground">{j.id.slice(0, 8)}</p>
                </div>
              )},
              { key: "status", header: "Status", align: "center", render: (j: any) => <Badge tone={j.status === "processing" ? "info" : j.status === "completed" ? "success" : j.status === "queued" ? "muted" : "warning"}>{j.status}</Badge> },
              { key: "priority", header: "Priority", align: "center", render: (j: any) => <Badge tone={j.priority === "high" ? "warning" : j.priority === "normal" ? "info" : "muted"}>{j.priority}</Badge> },
              { key: "progress", header: "Progress", align: "right", render: (j: any) => (
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${j.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{j.progress}%</span>
                </div>
              )},
              { key: "created", header: "Created", render: (j: any) => new Date(j.createdAt).toLocaleString() },
              { key: "actions", header: "", align: "right", render: (j: any) => (
                <div className="flex items-center gap-1 justify-end">
                  {j.status === "processing" && <Button variant="ghost" size="icon" className="size-8"><Pause className="size-4" /></Button>}
                  {j.status === "failed" && <Button variant="ghost" size="icon" className="size-8"><RotateCcw className="size-4" /></Button>}
                  {j.status === "queued" && <Button variant="ghost" size="icon" className="size-8"><Play className="size-4" /></Button>}
                  <Button variant="ghost" size="icon" className="size-8"><MoreVertical className="size-4" /></Button>
                </div>
              )},
            ]}
          />
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}