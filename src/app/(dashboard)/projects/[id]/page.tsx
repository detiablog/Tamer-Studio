import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { ProjectList } from "@/features/project/ProjectList";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Project — ${id} - Tamer Studio` };
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <AppShell>
        <PageLayout title="Project" breadcrumb={[{ label: "Projects", href: "/projects" }, { label: id }]}> 
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Project detail coming soon.
          </div>
        </PageLayout>
    </AppShell>
  );
}
