import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { ActionButton } from "@/components/ui/ActionButton"

export const metadata = { title: "Publishing - Tamer Studio", description: "Schedule and publish content to external platforms." }

export default function PublishingPage() {
  return (
    <AppShell>
      <PageLayout title={"Publishing"} description={"Schedule and publish content to external platforms."} breadcrumb={[{ label: "Publishing" }]} actions={<ActionButton>New Publication</ActionButton>}>
        <EmptyState title="No publications yet" description="Create a publication to schedule and publish content." />
      </PageLayout>
    </AppShell>
  )
}
