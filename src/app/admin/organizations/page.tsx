import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, MoreVertical } from "lucide-react";

const ORGANIZATIONS = [
  { id: "1", name: "Acme Studio", plan: "Pro", members: 12, workspaces: 3, status: "Active", joined: "Sep 15, 2026" },
  { id: "2", name: "Marketing Team", plan: "Enterprise", members: 8, workspaces: 2, status: "Active", joined: "Aug 22, 2026" },
  { id: "3", name: "Solo Creator", plan: "Starter", members: 1, workspaces: 1, status: "Active", joined: "Oct 1, 2026" },
  { id: "4", name: "Agency X", plan: "Enterprise", members: 24, workspaces: 5, status: "Active", joined: "Jul 10, 2026" },
  { id: "5", name: "Test Org", plan: "Starter", members: 2, workspaces: 1, status: "Suspended", joined: "Oct 5, 2026" },
];

export default function AdminOrganizationsPage() {
  const [search, setSearch] = React.useState("");

  const filtered = ORGANIZATIONS.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Organizations" value={156} delta="+8 this month" />
          <StatCard title="Enterprise Plans" value={24} delta="15% of total" />
          <StatCard title="Total Members" value={1248} delta="Across all orgs" />
          <StatCard title="Active" value={148} delta="95% retention" />
        </div>

        <DashboardCard title="Organizations" description="Manage organizations, plans, and members">
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Building2 className="mr-2 size-4" />
              Filter
            </Button>
          </div>

          <AdminDataTable
            data={filtered}
            keyExtractor={(o) => o.id}
            columns={[
              { key: "name", header: "Organization", render: (o: typeof ORGANIZATIONS[0]) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                    {o.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">Joined {o.joined}</p>
                  </div>
                </div>
              )},
              { key: "plan", header: "Plan", align: "center", render: (o: typeof ORGANIZATIONS[0]) => <Badge tone={o.plan === "Enterprise" ? "info" : o.plan === "Pro" ? "success" : "muted"}>{o.plan}</Badge> },
              { key: "members", header: "Members", align: "center", render: (o: typeof ORGANIZATIONS[0]) => (
                <span className="flex items-center gap-1 justify-center">
                  <Users className="size-3.5 text-muted-foreground" />
                  {o.members}
                </span>
              )},
              { key: "workspaces", header: "Workspaces", align: "center" },
              { key: "status", header: "Status", align: "center", render: (o: typeof ORGANIZATIONS[0]) => <Badge tone={o.status === "Active" ? "success" : "warning"}>{o.status}</Badge> },
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
