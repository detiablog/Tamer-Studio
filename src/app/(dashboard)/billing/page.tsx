import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Billing - Tamer Studio", description: "Manage billing, invoices, and payment methods." }

export default function BillingPage() {
  return (
    <AppShell>
      <PageLayout title={"Billing"} description={"Invoices, payment methods, and billing history."} breadcrumb={[{ label: "Billing" }]}>
        <EmptyState title="Billing coming soon" description="Manage invoices and payment methods here." />
      </PageLayout>
    </AppShell>
  )
}
