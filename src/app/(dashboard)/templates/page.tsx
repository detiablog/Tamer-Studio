import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Templates - Tamer Studio", description: "Manage prompt and production templates." }

export default function TemplatesPage() {
  return (
    <AppShell>
      <PageLayout title={"Templates"} description={"Reusable prompt and production templates."} breadcrumb={[{ label: "Templates" }]}>
        <EmptyState title="No templates yet" description="Create templates to speed up your workflow." />
      </PageLayout>
    </AppShell>
  )
}
