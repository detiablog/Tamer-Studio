import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Pause, RotateCcw, Play, MoreVertical } from "lucide-react";

const JOBS = [
  { id: "1", name: "Hero Video Render", status: "Running", owner: "Alice Johnson", workspace: "Acme Studio", progress: 72, priority: "High", created: "Oct 20, 2026" },
  { id: "2", name: "Product Image Batch", status: "Queued", owner: "Bob Smith", workspace: "Marketing Team", progress: 0, priority: "Medium", created: "Oct 20, 2026" },
  { id: "3", name: "Voiceover Generation", status: "Running", owner: "Carol White", workspace: "Acme Studio", progress: 45, priority: "Low", created: "Oct 19, 2026" },
  { id: "4", name: "Script Finalization", status: "Completed", owner: "David Lee", workspace: "Solo Creator", progress: 100, priority: "Medium", created: "Oct 18, 2026" },
  { id: "5", name: "Media Processing", status: "Failed", owner: "Eva Green", workspace: "Agency X", progress: 30, priority: "High", created: "Oct 17, 2026" },
  { id: "6", name: "Thumbnail Generation", status: "Queued", owner: "Frank Miller", workspace: "Acme Studio", progress: 0, priority: "Low", created: "Oct 21, 2026" },
];

export default function AdminJobsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filtered = statusFilter === "all" ? JOBS : JOBS.filter((j) => j.status.toLowerCase() === statusFilter);

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Jobs" value={1240} delta="+24 today" />
          <StatCard title="Running" value={42} delta="12 queued" />
          <StatCard title="Completed" value={1180} delta="95% success rate" />
          <StatCard title="Failed" value={18} delta="Retry available" />
        </div>

        <DashboardCard title="Production Jobs" description="Monitor and manage jobs across all workspaces">
          <div className="flex items-center gap-2 pb-4">
            {["all", "running", "queued", "completed", "failed"].map((status) => (
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
              { key: "name", header: "Job", render: (j: typeof JOBS[0]) => (
                <div>
                  <p className="font-medium">{j.name}</p>
                  <p className="text-xs text-muted-foreground">{j.workspace}</p>
                </div>
              )},
              { key: "status", header: "Status", align: "center", render: (j: typeof JOBS[0]) => <Badge tone={j.status === "Running" ? "info" : j.status === "Completed" ? "success" : j.status === "Queued" ? "muted" : "warning"}>{j.status}</Badge> },
              { key: "priority", header: "Priority", align: "center", render: (j: typeof JOBS[0]) => <Badge tone={j.priority === "High" ? "warning" : j.priority === "Medium" ? "info" : "muted"}>{j.priority}</Badge> },
              { key: "progress", header: "Progress", align: "right", render: (j: typeof JOBS[0]) => (
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${j.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{j.progress}%</span>
                </div>
              )},
              { key: "owner", header: "Owner" },
              { key: "created", header: "Created" },
              { key: "actions", header: "", align: "right", render: (j: typeof JOBS[0]) => (
                <div className="flex items-center gap-1 justify-end">
                  {j.status === "Running" && <Button variant="ghost" size="icon" className="size-8"><Pause className="size-4" /></Button>}
                  {j.status === "Failed" && <Button variant="ghost" size="icon" className="size-8"><RotateCcw className="size-4" /></Button>}
                  {j.status === "Queued" && <Button variant="ghost" size="icon" className="size-8"><Play className="size-4" /></Button>}
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
