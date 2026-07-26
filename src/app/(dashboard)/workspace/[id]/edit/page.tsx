"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { workspaceStore } from "@/features/workspace/workspace.store";
import { WorkspaceEditForm } from "@/components/workspace/WorkspaceEditForm";
import { useLocalizationContext } from "@/providers/localization";

export default function WorkspaceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { t } = useLocalizationContext();
  React.useEffect(() => {
    const ws = workspaceStore.get(id);
    document.title = ws ? `Edit ${ws.name} - Tamer Studio` : t("workspace.editTitle", "Edit Workspace") + " - Tamer Studio";
  }, [id, t]);

  return (
    <AppShell>
      <PageLayout
        title={t("workspace.editTitle", "Edit Workspace")}
        breadcrumb={[
          { label: "Workspace", href: "/workspace" },
          { label: id, href: `/workspace/${id}` },
          { label: "Edit" },
        ]}
      >
        <WorkspaceEditForm id={id} />
      </PageLayout>
    </AppShell>
  );
}
