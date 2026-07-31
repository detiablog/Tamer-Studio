"use client";

import * as React from "react";
import { workspaceStore } from "@/features/workspace/workspace.store";
import { WorkspaceEditForm } from "@/components/workspace/WorkspaceEditForm";
import { useLocalizationContext } from "@/providers/localization";

export default function WorkspaceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { t } = useLocalizationContext();
  React.useEffect(() => {
    const ws = workspaceStore.get(id);
    document.title = ws ? `${t("common.edit")} ${ws.name} - ${t("brand.name")}` : `${t("workspace.editTitle", "Edit Workspace")} - ${t("brand.name")}`;
  }, [id, t]);

  return <WorkspaceEditForm id={id} />;
}
