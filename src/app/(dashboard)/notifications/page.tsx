"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button";
import { CheckCheck, Settings } from "lucide-react";
import { NotificationsContent } from "@/components/dashboard/NotificationsContent";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { t } = useLocalizationContext();
  const markAllReadRef = React.useRef<(() => void) | null>(null);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications?limit=100", { cache: "no-store" });
      const data = await res.json();
      const unread = (data.notifications ?? []).filter((n: any) => !n.read);
      if (unread.length === 0) {
        toast.info(t("notifications.noUnread", "No unread notifications"));
        return;
      }
      await Promise.all(
        unread.map((n: any) =>
          fetch(`/api/notifications/${n.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "read" }),
          })
        )
      );
      markAllReadRef.current?.();
      toast.success(t("notifications.allMarkedRead", "All notifications marked as read"));
    } catch {
      toast.error(t("notifications.markAllReadFailed", "Failed to mark all as read"));
    }
  };

  return (
    <AppShell>
      <PageLayout
        title={t("notifications.pageTitle", "Notifications")}
        description={t("notifications.description", "Manage notification preferences and history.")}
        breadcrumb={[{ label: t("notifications.pageTitle", "Notifications") }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 size-4" />
              {t("notifications.markAllRead", "Mark all read")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast.info(t("notifications.preferencesComingSoon", "Preferences coming soon"))}>
              <Settings className="mr-2 size-4" />
              {t("notifications.preferences", "Preferences")}
            </Button>
          </div>
        }
      >
        <NotificationsContent onMarkedAllRead={(fn) => { markAllReadRef.current = fn; }} />
      </PageLayout>
    </AppShell>
  );
}
