"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button";
import { CheckCheck, Settings } from "lucide-react";
import { NotificationsContent } from "@/components/dashboard/NotificationsContent";
import { useLocalizationContext } from "@/providers/localization";

export default function NotificationsPage() {
  const { t } = useLocalizationContext();
  return (
    <AppShell>
      <PageLayout
        title={t("notifications.pageTitle", "Notifications")}
        description={t("notifications.description", "Manage notification preferences and history.")}
        breadcrumb={[{ label: t("notifications.pageTitle", "Notifications") }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <CheckCheck className="mr-2 size-4" />
              {t("notifications.markAllRead", "Mark all read")}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="mr-2 size-4" />
              {t("notifications.preferences", "Preferences")}
            </Button>
          </div>
        }
      >
        <NotificationsContent />
      </PageLayout>
    </AppShell>
  );
}
