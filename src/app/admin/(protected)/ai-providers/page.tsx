"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function AIProvidersPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "AI Providers" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Providers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage AI provider integrations</p>
        </div>
        <p className="text-muted-foreground">AI Providers management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
