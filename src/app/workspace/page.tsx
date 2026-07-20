import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { WorkspaceList } from "@/features/workspace/WorkspaceList"

export const metadata = { title: "Workspace - Tamer Studio", description: "Manage workspaces, teams, and members." }

export default function WorkspacePage() {
  return (
    <AppShell>
      <PageLayout title={"Workspace"} description={"Manage your workspace and teams."} breadcrumb={[{ label: "Workspace" }]}>
        <WorkspaceList />
      </PageLayout>
    </AppShell>
  )
}
