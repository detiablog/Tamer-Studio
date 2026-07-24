"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your admin profile</p>
        </div>
        <p className="text-muted-foreground">Profile management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
