import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { ActionButton } from "@/components/ui/ActionButton"

export const metadata = { title: "Settings - Tamer Studio", description: "Configure application and account settings for your workspace." }

export default function SettingsPage() {
  return (
    <AppShell>
      <PageLayout title={"Settings"} description={"Application and account settings."} breadcrumb={[{ label: "Settings" }]} actions={<ActionButton>Settings</ActionButton>}>
        <EmptyState title="No settings" description="Configure your workspace and preferences here." />
      </PageLayout>
    </AppShell>
  )
}
