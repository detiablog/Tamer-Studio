import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Notifications - Tamer Studio", description: "Manage notification preferences." }

export default function NotificationsPage() {
  return (
    <AppShell>
      <PageLayout title={"Notifications"} description={"Notification preferences and history."} breadcrumb={[{ label: "Notifications" }]}>
        <EmptyState title="No notifications" description="You are up to date." />
      </PageLayout>
    </AppShell>
  )
}
