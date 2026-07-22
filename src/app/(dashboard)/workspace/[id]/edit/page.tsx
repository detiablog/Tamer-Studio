"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { workspaceStore } from "@/features/workspace/workspace.store";
import { WorkspaceEditForm } from "@/components/workspace/WorkspaceEditForm";

export default function WorkspaceEditPage({ params }: { params: { id: string } }) {
  React.useEffect(() => {
    const ws = workspaceStore.get(params.id);
    document.title = ws ? `Edit ${ws.name} - Tamer Studio` : "Edit Workspace - Tamer Studio";
  }, [params.id]);

  return (
    <AppShell>
      <PageLayout
        title="Edit Workspace"
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
