import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { MoreVertical } from "lucide-react";

const SUBSCRIPTIONS = [
  { id: "1", org: "Acme Studio", plan: "Pro", status: "Active", renews: "Nov 1, 2026", amount: "$49.00" },
  { id: "2", org: "Marketing Team", plan: "Enterprise", status: "Active", renews: "Nov 1, 2026", amount: "$199.00" },
  { id: "3", org: "Solo Creator", plan: "Starter", status: "Active", renews: "Nov 1, 2026", amount: "$0.00" },
  { id: "4", org: "Agency X", plan: "Enterprise", status: "Past Due", renews: "Oct 15, 2026", amount: "$199.00" },
  { id: "5", org: "Test Org", plan: "Starter", status: "Canceled", renews: "—", amount: "$0.00" },
];

export default function AdminSubscriptionsPage() {
  const activeCount = SUBSCRIPTIONS.filter((s) => s.status === "Active").length;
  const totalRevenue = SUBSCRIPTIONS.reduce((sum, s) => sum + parseFloat(s.amount.replace("$", "")), 0);

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active Subscriptions" value={activeCount} delta="+2 this month" />
          <StatCard title="Monthly Revenue" value={`$${totalRevenue.toFixed(2)}`} delta="Recurring" />
          <StatCard title="Churn Rate" value="2.1%" delta="-0.5% vs last month" />
          <StatCard title="Avg. Plan Value" value="$49.42" delta="Per subscriber" />
        </div>

        <DashboardCard title="Subscriptions" description="Manage plans, subscriptions, and renewals">
          <AdminDataTable
            data={SUBSCRIPTIONS}
            keyExtractor={(s) => s.id}
            columns={[
              { key: "org", header: "Organization", render: (s: typeof SUBSCRIPTIONS[0]) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                    {s.org.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="font-medium">{s.org}</span>
                </div>
              )},
              { key: "plan", header: "Plan", align: "center", render: (s: typeof SUBSCRIPTIONS[0]) => <Badge tone={s.plan === "Enterprise" ? "info" : s.plan === "Pro" ? "success" : "muted"}>{s.plan}</Badge> },
              { key: "amount", header: "Amount", align: "right" },
              { key: "renews", header: "Renews" },
              { key: "status", header: "Status", align: "center", render: (s: typeof SUBSCRIPTIONS[0]) => <Badge tone={s.status === "Active" ? "success" : s.status === "Past Due" ? "warning" : "muted"}>{s.status}</Badge> },
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
