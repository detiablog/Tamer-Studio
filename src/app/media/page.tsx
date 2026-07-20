import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { ActionButton } from "@/components/ui/ActionButton"

export const metadata = { title: "Media Library - Tamer Studio", description: "Manage images, video, audio, and generated assets." }

export default function MediaPage() {
  return (
    <AppShell>
      <PageLayout title={"Media Library"} description={"Store and manage images, audio and video."} breadcrumb={[{ label: "Media" }]} actions={<ActionButton>Upload Media</ActionButton>}>
        <EmptyState title="No media yet" description="Generate or upload media to see it here." />
      </PageLayout>
    </AppShell>
  )
}
