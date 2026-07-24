"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Jobs" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor and manage background jobs</p>
        </div>
        <p className="text-muted-foreground">Jobs management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
