"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function APIKeysPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "API Keys" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage API keys and tokens</p>
        </div>
        <p className="text-muted-foreground">API keys management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
