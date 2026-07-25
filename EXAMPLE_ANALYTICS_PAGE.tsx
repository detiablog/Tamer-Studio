"use client";

import * as React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { useLocalizationContext } from "@/providers/localization";

/**
 * Example: Analytics Page
 * Shows how to use the AnalyticsDashboard component with real Recharts
 */
export default function AnalyticsPage() {
  const { t } = useLocalizationContext();
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <AdminShell>
      <PageLayout
        title={t("analytics.title", "Analytics")}
        breadcrumb={[{ label: t("analytics.title", "Analytics") }]}
      >
        <div className="space-y-6">
          <AnalyticsDashboard
            title={t("analytics.dashboard", "Platform Analytics")}
            description={t(
              "analytics.description",
              "Real-time metrics and performance data"
            )}
            showMetrics={true}
            isLoading={isLoading}
          />
        </div>
      </PageLayout>
    </AdminShell>
  );
}
