import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { ProjectDetail } from "@/components/project/ProjectDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Project — ${id} - Tamer Studio` };
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = params.id;
  return (
    <AppShell>
        <PageLayout title={`Project`} breadcrumb={[{ label: "Projects", href: "/projects" }, { label: id }]}> 
          <ProjectDetail id={id} />
      </PageLayout>
    </AppShell>
  );
}
