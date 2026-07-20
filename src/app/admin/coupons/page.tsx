import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Ticket, MoreVertical } from "lucide-react";

const COUPONS = [
  { id: "1", code: "LAUNCH2026", type: "Percentage", value: "20%", uses: 145, limit: 500, expires: "Dec 31, 2026", status: "Active" },
  { id: "2", code: "WELCOME50", type: "Fixed", value: "$50", uses: 89, limit: 200, expires: "Nov 30, 2026", status: "Active" },
  { id: "3", code: "BLACKFRIDAY", type: "Percentage", value: "30%", uses: 0, limit: 1000, expires: "Nov 28, 2026", status: "Scheduled" },
  { id: "4", code: "EXPIRED10", type: "Percentage", value: "10%", uses: 200, limit: 200, expires: "Sep 30, 2026", status: "Expired" },
];

export default function AdminCouponsPage() {
  const activeCount = COUPONS.filter((c) => c.status === "Active").length;
  const totalUses = COUPONS.reduce((sum, c) => sum + c.uses, 0);

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Coupons" value={4} delta="2 active" />
          <StatCard title="Total Uses" value={totalUses} delta="All time" />
          <StatCard title="Active" value={activeCount} delta="Currently running" />
          <StatCard title="Expired" value={1} delta="Historical" />
        </div>

        <DashboardCard title="Coupons" description="Create and manage discount codes and promotions">
          <div className="flex items-center gap-2 pb-4">
            <Button size="sm">
              <Ticket className="mr-2 size-4" />
              Create Coupon
            </Button>
          </div>

          <AdminDataTable
            data={COUPONS}
            keyExtractor={(c) => c.id}
            columns={[
              { key: "code", header: "Code", render: (c: typeof COUPONS[0]) => (
                <div className="flex items-center gap-2">
                  <Ticket className="size-4 text-muted-foreground" />
                  <span className="font-mono font-medium">{c.code}</span>
                </div>
              )},
              { key: "type", header: "Type", align: "center" },
              { key: "value", header: "Value", align: "center", render: (c: typeof COUPONS[0]) => (
                <span className="font-medium text-green-600 dark:text-green-400">{c.value}</span>
              )},
              { key: "uses", header: "Uses", align: "center", render: (c: typeof COUPONS[0]) => (
                <span>
                  {c.uses} / {c.limit}
                </span>
              )},
              { key: "expires", header: "Expires" },
              { key: "status", header: "Status", align: "center", render: (c: typeof COUPONS[0]) => <Badge tone={c.status === "Active" ? "success" : c.status === "Scheduled" ? "info" : "muted"}>{c.status}</Badge> },
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
