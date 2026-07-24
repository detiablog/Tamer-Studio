"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Subscriptions" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage subscriptions and plans</p>
        </div>
        <p className="text-muted-foreground">Subscriptions management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
