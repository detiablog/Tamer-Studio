import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react";

const RECENT_USERS = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", joined: "Oct 20, 2026" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "User", status: "Active", joined: "Oct 19, 2026" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "User", status: "Pending", joined: "Oct 18, 2026" },
  { id: "4", name: "David Lee", email: "david@example.com", role: "Admin", status: "Active", joined: "Oct 17, 2026" },
  { id: "5", name: "Eva Green", email: "eva@example.com", role: "User", status: "Suspended", joined: "Oct 15, 2026" },
];

const RECENT_JOBS = [
  { id: "1", name: "Hero Video Render", status: "Running", owner: "Alice Johnson", progress: 72 },
  { id: "2", name: "Product Image Batch", status: "Queued", owner: "Bob Smith", progress: 0 },
  { id: "3", name: "Voiceover Generation", status: "Running", owner: "Carol White", progress: 45 },
  { id: "4", name: "Script Finalization", status: "Completed", owner: "David Lee", progress: 100 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={1248} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +12% this week</span>} />
        <StatCard title="Active Workspaces" value={86} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +5 this week</span>} />
        <StatCard title="Active Jobs" value={42} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowDownRight className="size-3" /> -3 from yesterday</span>} />
        <StatCard title="Revenue" value="$12,450" delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +8.2% vs last month</span>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Recent Users" description="Latest user signups across the platform">
          <AdminDataTable
            data={RECENT_USERS}
            keyExtractor={(u) => u.id}
            columns={[
              { key: "name", header: "User", render: (u) => (
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              )},
              { key: "role", header: "Role", align: "center", render: (u) => <Badge tone={u.role === "Admin" ? "info" : "muted"}>{u.role}</Badge> },
              { key: "status", header: "Status", align: "center", render: (u) => <Badge tone={u.status === "Active" ? "success" : u.status === "Pending" ? "warning" : "muted"}>{u.status}</Badge> },
              { key: "joined", header: "Joined" },
              { key: "actions", header: "", align: "right", render: () => (
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              )},
            ]}
          />
          <div className="mt-4">
            <Link href="/admin/users" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">View all users</Link>
          </div>
        </DashboardCard>

        <DashboardCard title="Production Jobs" description="Recent jobs across all workspaces">
          <AdminDataTable
            data={RECENT_JOBS}
            keyExtractor={(j) => j.id}
            columns={[
              { key: "name", header: "Job", render: (j) => (
                <div>
                  <p className="font-medium">{j.name}</p>
                  <p className="text-xs text-muted-foreground">Owner: {j.owner}</p>
                </div>
              )},
              { key: "status", header: "Status", align: "center", render: (j) => <Badge tone={j.status === "Running" ? "info" : j.status === "Completed" ? "success" : j.status === "Queued" ? "muted" : "default"}>{j.status}</Badge> },
              { key: "progress", header: "Progress", align: "right", render: (j) => (
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${j.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{j.progress}%</span>
                </div>
              )},
              { key: "actions", header: "", align: "right", render: () => (
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              )},
            ]}
          />
          <div className="mt-4">
            <Link href="/admin/jobs" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">View all jobs</Link>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Revenue Overview" description="Platform revenue for the last 7 days">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Today", value: "$1,240", change: "+5.2%" },
            { label: "This Week", value: "$8,450", change: "+12.1%" },
            { label: "This Month", value: "$12,450", change: "+8.2%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                <TrendingUp className="size-3" />
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
