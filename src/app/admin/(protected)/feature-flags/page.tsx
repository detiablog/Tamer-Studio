"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function FeatureFlagsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Feature Flags" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage feature toggles and rollouts</p>
        </div>
        <p className="text-muted-foreground">Feature flags management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
