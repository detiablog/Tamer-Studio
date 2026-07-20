import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { BarChart3, MoreVertical } from "lucide-react";

const QUEUES = [
  { id: "1", name: "video-processing", depth: 12, throughput: "2.1/min", avgWait: "45s", status: "Healthy", failed: 0 },
  { id: "2", name: "image-generation", depth: 45, throughput: "5.4/min", avgWait: "1m 20s", status: "Healthy", failed: 0 },
  { id: "3", name: "audio-generation", depth: 3, throughput: "0.8/min", avgWait: "2m", status: "Degraded", failed: 2 },
  { id: "4", name: "script-generation", depth: 0, throughput: "0/min", avgWait: "—", status: "Idle", failed: 0 },
  { id: "5", name: "media-processing", depth: 28, throughput: "3.2/min", avgWait: "1m 10s", status: "Healthy", failed: 1 },
];

export default function AdminQueuesPage() {
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Queues" value={5} delta="3 processing" />
          <StatCard title="Total Depth" value={88} delta="Jobs waiting" />
          <StatCard title="Throughput" value="11.5/min" delta="Combined" />
          <StatCard title="Failed Jobs" value={3} delta="Retry available" />
        </div>

        <DashboardCard title="Queues" description="Inspect queue health, throughput, and failures">
          <AdminDataTable
            data={QUEUES}
            keyExtractor={(q) => q.id}
            columns={[
              { key: "name", header: "Queue", render: (q: typeof QUEUES[0]) => (
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
              { key: "failed", header: "Failed", align: "center", render: (q: typeof QUEUES[0]) => (
                <span className={q.failed > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}>
                  {q.failed}
                </span>
              )},
              { key: "status", header: "Status", align: "center", render: (q: typeof QUEUES[0]) => <Badge tone={q.status === "Healthy" ? "success" : q.status === "Degraded" ? "warning" : "muted"}>{q.status}</Badge> },
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
