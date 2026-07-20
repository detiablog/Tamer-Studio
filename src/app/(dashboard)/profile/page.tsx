import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"

export const metadata = { title: "Profile - Tamer Studio", description: "Manage your profile and preferences." }

export default function ProfilePage() {
  return (
    <AppShell>
      <PageLayout title={"Profile"} description={"Your account information and preferences."} breadcrumb={[{ label: "Profile" }]}>
        <EmptyState title="Profile settings coming soon" description="Manage your name, avatar, and preferences here." />
      </PageLayout>
    </AppShell>
  )
}
