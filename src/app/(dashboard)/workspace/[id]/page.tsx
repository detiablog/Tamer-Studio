import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { WorkspaceDetail } from "@/components/workspace/WorkspaceDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Workspace — ${id} - Tamer Studio` };
}

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <AppShell>
        <PageLayout title={`Workspace`} breadcrumb={[{ label: "Workspace", href: "/workspace" }, { label: id }]}> 
          <WorkspaceDetail id={id} />
      </PageLayout>
    </AppShell>
  );
}
