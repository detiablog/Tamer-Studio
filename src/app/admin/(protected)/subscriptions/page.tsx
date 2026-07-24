"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, RefreshCw, CreditCard, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_SUBSCRIPTIONS = [
  { id: "sub_1", plan: "Pro", workspace: "Acme Studio", status: "Active", billingCycle: "monthly", amount: "$99.00", nextBilling: "23/08/2026", startedAt: "15/07/2026" },
  { id: "sub_2", plan: "Enterprise", workspace: "Marketing Team", status: "Active", billingCycle: "monthly", amount: "$299.00", nextBilling: "22/08/2026", startedAt: "10/07/2026" },
  { id: "sub_3", plan: "Starter", workspace: "Solo Creator", status: "Cancelled", billingCycle: "monthly", amount: "$29.00", nextBilling: "—", startedAt: "05/07/2026" },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState(MOCK_SUBSCRIPTIONS);
  const [search, setSearch] = React.useState("");

  const filtered = subscriptions.filter((s) => s.plan.toLowerCase().includes(search.toLowerCase()) || s.workspace.toLowerCase().includes(search.toLowerCase()));

  const handleCancel = (id: string) => {
    if (!confirm("Cancel this subscription?")) return;
    setSubscriptions((prev) => prev.map((s) => s.id === id ? { ...s, status: "Cancelled" } : s));
    toast.success("Subscription cancelled");
  };

  const handleReactivate = (id: string) => {
    setSubscriptions((prev) => prev.map((s) => s.id === id ? { ...s, status: "Active" } : s));
    toast.success("Subscription reactivated");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Subscriptions" }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage subscriptions and plans</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("Subscriptions synced with billing provider")}><RefreshCw className="mr-2 size-4" />Refresh</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subscriptions..." className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(s) => s.id}
          columns={[
            { key: "plan", header: "Plan", render: (s: any) => <Badge>{s.plan}</Badge> },
            { key: "workspace", header: "Workspace", render: (s: any) => <span className="text-sm">{s.workspace}</span> },
            { key: "status", header: "Status", render: (s: any) => <Badge tone={s.status === "Active" ? "success" : "muted"}>{s.status}</Badge> },
            { key: "amount", header: "Amount", render: (s: any) => <span className="font-medium text-sm">{s.amount}</span> },
            { key: "billingCycle", header: "Cycle", render: (s: any) => <span className="text-sm capitalize">{s.billingCycle}</span> },
            { key: "nextBilling", header: "Next Billing", render: (s: any) => <span className="text-sm text-muted-foreground">{s.nextBilling}</span> },
            { key: "actions", header: "", align: "right", render: (s: any) => (
              <div className="flex items-center gap-1 justify-end">
                {s.status === "Active" ? <Button variant="ghost" size="icon-xs" onClick={() => handleCancel(s.id)} className="text-destructive hover:text-destructive"><ArrowUpRight className="size-3.5" />Cancel</Button> : <Button variant="ghost" size="icon-xs" onClick={() => handleReactivate(s.id)}><ArrowUpRight className="size-3.5" />Reactivate</Button>}
              </div>
            )},
          ]}
        />
      </DashboardCard>
    </div>
  );
}