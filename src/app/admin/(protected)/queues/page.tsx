"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function QueuesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Queues" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Queues</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor job queues and workers</p>
        </div>
        <p className="text-muted-foreground">Queues management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
