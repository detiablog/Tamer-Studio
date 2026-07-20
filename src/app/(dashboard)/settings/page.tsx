import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Settings - Tamer Studio", description: "Manage workspace and account settings." }

export default function SettingsPage() {
  return (
    <AppShell>
      <PageLayout title={"Settings"} description={"Workspace and account configuration."} breadcrumb={[{ label: "Settings" }]}>
        <EmptyState title="Settings coming soon" description="Configure your workspace and integrations here." />
      </PageLayout>
    </AppShell>
  )
}
