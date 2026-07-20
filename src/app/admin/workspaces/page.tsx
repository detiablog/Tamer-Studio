import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Users, MoreVertical } from "lucide-react";

const WORKSPACES = [
  { id: "1", name: "Acme Studio", plan: "Pro", members: 12, projects: 8, status: "Active", created: "Sep 15, 2026" },
  { id: "2", name: "Marketing Team", plan: "Enterprise", members: 8, projects: 5, status: "Active", created: "Aug 22, 2026" },
  { id: "3", name: "Solo Creator", plan: "Starter", members: 1, projects: 2, status: "Active", created: "Oct 1, 2026" },
  { id: "4", name: "Agency X", plan: "Enterprise", members: 24, projects: 15, status: "Active", created: "Jul 10, 2026" },
  { id: "5", name: "Test Workspace", plan: "Starter", members: 2, projects: 1, status: "Suspended", created: "Oct 5, 2026" },
];

export default function AdminWorkspacesPage() {
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Workspaces" value={156} delta="+8 this month" />
          <StatCard title="Active" value={148} delta="95% of total" />
          <StatCard title="Suspended" value={8} delta="Requires review" />
          <StatCard title="Avg. Members" value={6.4} delta="Per workspace" />
        </div>

        <DashboardCard title="Workspaces" description="Inspect and manage workspaces across the platform">
          <AdminDataTable
            data={WORKSPACES}
            keyExtractor={(w) => w.id}
            columns={[
              { key: "name", header: "Workspace", render: (w: typeof WORKSPACES[0]) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                    {w.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-xs text-muted-foreground">Created {w.created}</p>
                  </div>
                </div>
              )},
              { key: "plan", header: "Plan", align: "center", render: (w: typeof WORKSPACES[0]) => <Badge tone={w.plan === "Enterprise" ? "info" : w.plan === "Pro" ? "success" : "muted"}>{w.plan}</Badge> },
              { key: "members", header: "Members", align: "center", render: (w: typeof WORKSPACES[0]) => (
                <span className="flex items-center gap-1 justify-center">
                  <Users className="size-3.5 text-muted-foreground" />
                  {w.members}
                </span>
              )},
              { key: "projects", header: "Projects", align: "center" },
              { key: "status", header: "Status", align: "center", render: (w: typeof WORKSPACES[0]) => <Badge tone={w.status === "Active" ? "success" : "warning"}>{w.status}</Badge> },
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
