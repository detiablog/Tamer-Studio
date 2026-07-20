import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { workspaceStore } from "@/features/workspace/workspace.store";
import { WorkspaceEditForm } from "@/components/workspace/WorkspaceEditForm";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const ws = workspaceStore.get(params.id);
  return { title: ws ? `Edit ${ws.name} - Tamer Studio` : "Edit Workspace - Tamer Studio" };
}

export default function WorkspaceEditPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <PageLayout
        title={`Edit Workspace`}
        breadcrumb={[
          { label: "Workspace", href: "/workspace" },
          { label: params.id, href: `/workspace/${params.id}` },
          { label: "Edit" },
        ]}
      >
        <WorkspaceEditForm id={params.id} />
      </PageLayout>
    </AppShell>
  );
}
