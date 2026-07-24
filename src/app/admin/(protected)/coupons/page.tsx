"use client";

import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Coupons" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage discount codes and promotions</p>
        </div>
        <p className="text-muted-foreground">Coupons management coming soon...</p>
      </DashboardCard>
    </div>
  );
}
