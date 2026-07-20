import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { WorkspaceDetail } from "@/components/workspace/WorkspaceDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Workspace — ${params.id} - Tamer Studio` };
}

export default function WorkspaceDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <PageLayout title={`Workspace`} breadcrumb={[{ label: "Workspace", href: "/workspace" }, { label: params.id }]}> 
        <WorkspaceDetail id={params.id} />
      </PageLayout>
    </AppShell>
  );
}
