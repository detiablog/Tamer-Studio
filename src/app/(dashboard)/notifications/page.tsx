import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button";
import { CheckCheck, Settings } from "lucide-react";
import { NotificationsContent } from "@/components/dashboard/NotificationsContent";

export const metadata = { title: "Notifications - Tamer Studio", description: "Manage notification preferences and history." };

export default function NotificationsPage() {
  return (
    <AppShell>
      <PageLayout
        title={"Notifications"}
        description={"Notification preferences and history."}
        breadcrumb={[{ label: "Notifications" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <CheckCheck className="mr-2 size-4" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="mr-2 size-4" />
              Preferences
            </Button>
          </div>
        }
      >
        <NotificationsContent />
      </PageLayout>
    </AppShell>
  );
}
