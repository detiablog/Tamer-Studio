import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <PageLayout title="Dashboard" breadcrumb={[{ label: "Dashboard" }]}>
        {children}
      </PageLayout>
    </AppShell>
  );
}
