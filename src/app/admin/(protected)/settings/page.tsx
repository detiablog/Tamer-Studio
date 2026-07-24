"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage system settings and configuration</p>
        </div>
        <p className="text-muted-foreground">Settings management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
