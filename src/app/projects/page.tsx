import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { ProjectList } from "@/features/project/ProjectList"

export const metadata = { title: "Projects - Tamer Studio", description: "Create and manage production projects, assets, and schedules." }

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageLayout title={"Projects"} description={"Organize and manage your production projects."} breadcrumb={[{ label: "Projects" }]}>
        <ProjectList />
      </PageLayout>
    </AppShell>
  )
}
