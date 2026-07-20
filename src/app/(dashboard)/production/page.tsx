import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { ActionButton } from "@/components/ui/ActionButton"

export const metadata = { title: "Production - Tamer Studio", description: "Manage production pipelines, queues and job history." }

export default function ProductionPage() {
  return (
    <AppShell>
      <PageLayout title={"Production"} description={"Production pipeline and queues."} breadcrumb={[{ label: "Production" }]} actions={<ActionButton>New Production</ActionButton>}>
        <EmptyState title="No productions yet" description="Start a production to see progress and logs." />
      </PageLayout>
    </AppShell>
  )
}
