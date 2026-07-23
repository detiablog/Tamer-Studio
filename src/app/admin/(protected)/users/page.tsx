"use client";

import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoreVertical, UserPlus } from "lucide-react";

const USERS = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", joined: "Oct 20, 2026", lastActive: "2 minutes ago" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "User", status: "Active", joined: "Oct 19, 2026", lastActive: "1 hour ago" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "User", status: "Pending", joined: "Oct 18, 2026", lastActive: "Never" },
  { id: "4", name: "David Lee", email: "david@example.com", role: "Admin", status: "Active", joined: "Oct 17, 2026", lastActive: "3 hours ago" },
  { id: "5", name: "Eva Green", email: "eva@example.com", role: "User", status: "Suspended", joined: "Oct 15, 2026", lastActive: "2 days ago" },
  { id: "6", name: "Frank Miller", email: "frank@example.com", role: "User", status: "Active", joined: "Oct 14, 2026", lastActive: "5 hours ago" },
  { id: "7", name: "Grace Hopper", email: "grace@example.com", role: "User", status: "Active", joined: "Oct 12, 2026", lastActive: "1 day ago" },
  { id: "8", name: "Henry Ford", email: "henry@example.com", role: "User", status: "Inactive", joined: "Oct 10, 2026", lastActive: "1 week ago" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState("");

  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <RoleGuard allowedRoles={["workspace_admin", "organization_admin", "system_admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={1248} delta="+12% this week" />
          <StatCard title="Active" value={892} delta="71% of total" />
          <StatCard title="Pending" value={45} delta="Awaiting verification" />
          <StatCard title="Suspended" value={12} delta="Action required" />
        </div>

        <DashboardCard title="Users" description="Manage platform users, roles, and access">
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 size-4" />
              Filter
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 size-4" />
              Add User
            </Button>
          </div>

          <AdminDataTable
            data={filtered}
            keyExtractor={(u) => u.id}
            columns={[
              { key: "user", header: "User", render: (u: typeof USERS[0]) => (
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              )},
              { key: "role", header: "Role", align: "center", render: (u: typeof USERS[0]) => <Badge tone={u.role === "Admin" ? "info" : "muted"}>{u.role}</Badge> },
              { key: "status", header: "Status", align: "center", render: (u: typeof USERS[0]) => <Badge tone={u.status === "Active" ? "success" : u.status === "Pending" ? "warning" : u.status === "Suspended" ? "warning" : "muted"}>{u.status}</Badge> },
              { key: "joined", header: "Joined" },
              { key: "lastActive", header: "Last Active" },
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
