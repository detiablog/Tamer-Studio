import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "API Keys - Tamer Studio", description: "Manage API keys for integrations." }

export default function ApiKeysPage() {
  return (
    <AppShell>
      <PageLayout title={"API Keys"} description={"Create and manage API keys for external access."} breadcrumb={[{ label: "API Keys" }]}>
        <EmptyState title="API keys coming soon" description="Generate and rotate API keys here." />
      </PageLayout>
    </AppShell>
  )
}
