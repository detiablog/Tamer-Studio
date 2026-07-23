"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { BarChart3, MoreVertical } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminQueuesPage() {
  const { data, error } = useSWR("/api/queues", fetcher);

  if (error) {
    return <div className="text-destructive">Failed to load queue data</div>;
  }

  const queues = data?.queues ?? [];
  const stats = data?.stats ?? {};

  return (
    <RoleGuard allowedRoles={["workspace_admin", "organization_admin", "system_admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Queues" value={queues.length} />
          <StatCard title="Total Depth" value={stats.depth ?? 0} delta="Jobs waiting" />
          <StatCard title="Failed Jobs" value={stats.failedCount ?? 0} delta="Retry available" />
          <StatCard title="Throughput" value={`${stats.queued ?? 0}/min`} />
        </div>

        <DashboardCard title="Queues" description="Inspect queue health, throughput, and failures">
          <AdminDataTable
            data={queues}
            keyExtractor={(q) => q.id}
            columns={[
              { key: "name", header: "Queue", render: (q: any) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40">
                    <BarChart3 className="size-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium font-mono text-xs">{q.name}</span>
                </div>
              )},
              { key: "depth", header: "Depth", align: "center" },
              { key: "throughput", header: "Throughput", align: "center" },
              { key: "avgWait", header: "Avg Wait", align: "center" },
              { key: "failed", header: "Failed", align: "center", render: (q: any) => (
                <span className={q.failed > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}>
                  {q.failed}
                </span>
              )},
              { key: "status", header: "Status", align: "center", render: (q: any) => <Badge tone={q.status === "Healthy" ? "success" : q.status === "Degraded" ? "warning" : "muted"}>{q.status}</Badge> },
              { key: "actions", header: "", align: "right", render: () => (
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              )},
            ]}
          />
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}