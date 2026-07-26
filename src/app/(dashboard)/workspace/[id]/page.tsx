import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Workspace — ${id} - Tamer Studio` };
}

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <AppShell>
        <PageLayout title="Workspace" breadcrumb={[{ label: "Workspace", href: "/workspace" }, { label: id }]}> 
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Workspace detail coming soon.
          </div>
        </PageLayout>
    </AppShell>
  );
}
