"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Audit Logs" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">View system audit and activity logs</p>
        </div>
        <p className="text-muted-foreground">Audit logs coming soon...</p>
      </DashboardCard>
    </div>
  );
}
