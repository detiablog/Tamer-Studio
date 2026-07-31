"use client";

import { PageLayout } from "@/components/ui/PageLayout";
import { useLocalizationContext } from "@/providers/localization";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocalizationContext();

  return (
    <PageLayout title={t("dashboard.title", "Dashboard")} breadcrumb={[{ label: t("dashboard.title", "Dashboard") }]}>
      {children}
    </PageLayout>
  );
}
