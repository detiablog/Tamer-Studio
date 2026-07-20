import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Download, TrendingUp } from "lucide-react";

const INVOICES = [
  { id: "1", org: "Acme Studio", plan: "Pro", amount: "$49.00", date: "Oct 1, 2026", status: "Paid" },
  { id: "2", org: "Marketing Team", plan: "Enterprise", amount: "$199.00", date: "Oct 1, 2026", status: "Paid" },
  { id: "3", org: "Solo Creator", plan: "Starter", amount: "$0.00", date: "Oct 1, 2026", status: "Paid" },
  { id: "4", org: "Agency X", plan: "Enterprise", amount: "$199.00", date: "Oct 1, 2026", status: "Pending" },
  { id: "5", org: "Test Org", plan: "Starter", amount: "$0.00", date: "Oct 1, 2026", status: "Failed" },
];

export default function AdminBillingPage() {
  const totalRevenue = INVOICES.reduce((sum, inv) => sum + parseFloat(inv.amount.replace("$", "")), 0);
  const paidRevenue = INVOICES.filter((i) => i.status === "Paid").reduce((sum, inv) => sum + parseFloat(inv.amount.replace("$", "")), 0);
  const pendingRevenue = INVOICES.filter((i) => i.status === "Pending").reduce((sum, inv) => sum + parseFloat(inv.amount.replace("$", "")), 0);

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} delta="This month" />
          <StatCard title="Paid" value={`$${paidRevenue.toFixed(2)}`} delta="Collected" />
          <StatCard title="Pending" value={`$${pendingRevenue.toFixed(2)}`} delta="Awaiting payment" />
          <StatCard title="Avg. Order" value="$49.42" delta="+$2.10 vs last month" />
        </div>

        <DashboardCard title="Invoices" description="Platform billing and payment history">
          <AdminDataTable
            data={INVOICES}
            keyExtractor={(inv) => inv.id}
            columns={[
              { key: "org", header: "Organization", render: (inv: typeof INVOICES[0]) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium">
                    {inv.org.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="font-medium">{inv.org}</span>
                </div>
              )},
              { key: "plan", header: "Plan", align: "center", render: (inv: typeof INVOICES[0]) => <Badge tone={inv.plan === "Enterprise" ? "info" : inv.plan === "Pro" ? "success" : "muted"}>{inv.plan}</Badge> },
              { key: "amount", header: "Amount", align: "right" },
              { key: "date", header: "Date" },
              { key: "status", header: "Status", align: "center", render: (inv: typeof INVOICES[0]) => <Badge tone={inv.status === "Paid" ? "success" : inv.status === "Pending" ? "warning" : "warning"}>{inv.status}</Badge> },
              { key: "actions", header: "", align: "right", render: () => (
                <Button variant="ghost" size="icon" className="size-8">
                  <Download className="size-4" />
                </Button>
              )},
            ]}
          />
        </DashboardCard>

        <DashboardCard title="Revenue Trend">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600/10 text-green-600 dark:text-green-400">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
              <p className="text-2xl font-semibold">$12,450</p>
              <p className="text-xs text-green-600 dark:text-green-400">+8.2% vs last month</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
