import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { ActionButton } from "@/components/ui/ActionButton"

export const metadata = { title: "AI Platform - Tamer Studio", description: "Manage AI providers, models, and prompt templates." }

export default function AIPage() {
  return (
    <AppShell>
      <PageLayout title={"AI Platform"} description={"Configure AI providers, models, and prompts."} breadcrumb={[{ label: "AI Platform" }]} actions={<ActionButton>Add Provider</ActionButton>}>
        <EmptyState title="No providers installed" description="Install a provider from the marketplace to get started." />
      </PageLayout>
    </AppShell>
  )
}
